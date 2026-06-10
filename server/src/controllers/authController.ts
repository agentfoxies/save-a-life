import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'save-a-life-secret-key-change-in-production';

// Initialize default owner
export const initializeAdmin = async () => {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      username: 'malek',
      password: 'SaveALife2024!',
      role: 'owner',
      approved: true
    });
    console.log('✅ Default owner created (username: malek)');
  }
};

// Register new admin (needs approval)
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const admin = await Admin.create({
      username,
      password,
      role: 'moderator',
      approved: false // Needs approval!
    });

    res.status(201).json({ 
      message: 'Registration submitted. Waiting for owner approval.',
      username: admin.username,
      approved: false
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login (only if approved)
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if approved
    if (!admin.approved) {
      return res.status(403).json({ error: 'Your account is pending approval from the owner.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get all admins (Owner only)
export const getAdmins = async (req: any, res: Response) => {
  try {
    if (req.admin.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can view admin list' });
    }
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

// Approve an admin (Owner only)
export const approveAdmin = async (req: any, res: Response) => {
  try {
    if (req.admin.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can approve admins' });
    }
    const { adminId } = req.params;
    const admin = await Admin.findByIdAndUpdate(adminId, { approved: true }, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json({ message: 'Admin approved', admin });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve' });
  }
};

// Remove an admin (Owner only)
export const removeAdmin = async (req: any, res: Response) => {
  try {
    if (req.admin.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can remove admins' });
    }
    const { adminId } = req.params;
    
    // Prevent removing yourself
    if (adminId === req.admin.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }
    
    const admin = await Admin.findByIdAndDelete(adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove admin' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) return res.status(401).json({ error: 'Invalid token' });
    if (!admin.approved) return res.status(403).json({ error: 'Account not approved' });
    res.json({ user: admin });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authMiddleware = async (req: any, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.approved) {
      return res.status(403).json({ error: 'Account not approved' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
