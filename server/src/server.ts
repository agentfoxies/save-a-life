import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean');
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { conversationRoutes } from './routes/conversationRoutes';
import { messageRoutes } from './routes/messageRoutes';
import { setupSocketHandlers } from './sockets/socketHandler';
import { cloudinaryConfig } from './config/cloudinary';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Trust proxy for Render
app.set('trust proxy', 1);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'DELETE', 'PATCH'] }
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 1000,
  validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);

cloudinaryConfig();

app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

setupSocketHandlers(io);

// Use MONGODB_URI from environment, with fallback
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set!');
  process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('URI starts with:', MONGODB_URI.substring(0, 30) + '...');

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
