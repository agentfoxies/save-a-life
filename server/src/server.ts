import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean');
import mongoose from 'mongoose';
import { conversationRoutes } from './routes/conversationRoutes';
import { messageRoutes } from './routes/messageRoutes';
import { authRoutes } from './routes/authRoutes';
import { setupSocketHandlers } from './sockets/socketHandler';
import { cloudinaryConfig } from './config/cloudinary';
import { initializeAdmin } from './controllers/authController';

const app = express();
const httpServer = createServer(app);

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
  validate: { xForwardedForHeader: false } as any
});
app.use('/api/', limiter);

cloudinaryConfig();
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/test-telegram', async (req, res) => {
  try {
    const r = await fetch('https://api.telegram.org/bot8851638627:AAEj2dvBhwgnzYDQBrBOhM6WZIKSB5CAsj4/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: '-5136710309', text: '✅ Save A Life alerts connected to this group! All staff will be notified here.' })
    });
    const data = await r.json();
    res.json({ ok: true, telegram: data });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

setupSocketHandlers(io);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mike2mememe_db_user:ameSxGP7OHeV2vx7@cluster0.rrrlxur.mongodb.net/savealife?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await initializeAdmin();
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = parseInt(process.env.PORT || '10000', 10);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// TEMPORARY: Reset admin accounts
app.get('/api/reset-admin', async (req, res) => {
  const { Admin } = require('./models/Admin');
  await Admin.deleteMany({});
  await Admin.create({
    username: 'malek',
    password: 'SaveALife2024!',
    role: 'owner',
    approved: true
  });
  res.json({ message: 'Admin reset. Login with malek / SaveALife2024!' });
});
