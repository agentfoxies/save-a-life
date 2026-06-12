import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'save-a-life-secret-key-change-in-production';

export const initializeAdmin = async () => {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      username: 'malek', password: 'SaveALife2024!', role: 'owner', approved: true, tokenVersion: 0
    });
    console.log('✅ Default owner created (username: malek)');
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    await Admin.create({ username, password, role: 'moderator', approved: false });
    res.status(201).json({ message: 'Registration submitted. Waiting for owner approval.' });
  } catch (error) { res.status(500).json({ error: 'Registration failed' }); }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    if (!admin.approved) return res.status(403).json({ error: 'Account pending approval.' });
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role, tokenVersion: admin.tokenVersion },
      JWT_SECRET, { expiresIn: '24h' }
    );
    res.json({ token, user: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (error) { res.status(500).json({ error: 'Login failed' }); }
};

export const getAdmins = async (req: any, res: Response) => {
  try {
    if (req.admin.role !== 'owner') return res.status(403).json({ error: 'Only owner can view admin list' });
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch admins' }); }
};

export const approveAdmin = async (req: any, res: Response) => {
  try {
    if (req.admin.role !== 'owner') return res.status(403).json({ error: 'Only owner' });
    const admin = await Admin.findByIdAndUpdate(req.params.adminId, { approved: true }, { new: true }).select('-password');
    res.json({ message: 'Approved', admin });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

export const removeAdmin = async (req: any, res: Response) => {
  try {
    if (req.admin.role !== 'owner') return res.status(403).json({ error: 'Only owner' });
    if (req.params.adminId === req.admin.id) return res.status(400).json({ error: 'Cannot remove yourself' });
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) return res.status(404).json({ error: 'Not found' });
    admin.tokenVersion += 1;
    await admin.save();
    await Admin.findByIdAndDelete(req.params.adminId);
    res.json({ message: 'Admin removed' });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

export const updateStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    if (!['online', 'busy', 'away', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const admin = await Admin.findByIdAndUpdate(req.admin.id, { 
      currentStatus: status, lastActive: new Date() 
    }, { new: true }).select('-password');
    res.json(admin);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

export const authMiddleware = async (req: any, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.approved) return res.status(403).json({ error: 'Account not approved or deleted' });
    if (decoded.tokenVersion !== admin.tokenVersion) return res.status(401).json({ error: 'Session expired' });
    req.admin = decoded;
    next();
  } catch (error) { res.status(401).json({ error: 'Invalid token' }); }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.approved) return res.status(403).json({ error: 'Account not valid' });
    if (decoded.tokenVersion !== admin.tokenVersion) return res.status(401).json({ error: 'Session expired' });
    res.json({ user: admin });
  } catch (error) { res.status(401).json({ error: 'Invalid token' }); }
};
