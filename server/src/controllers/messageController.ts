import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { cloudinary } from '../config/cloudinary';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('image');

export const uploadMiddleware = upload;

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: 1 });

    const total = await Message.countDocuments({ roomId });

    res.json({
      messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalMessages: total
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const uploadImage = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'save-a-life',
      resource_type: 'auto'
    });

    res.json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // If message had an image, delete it from Cloudinary
    if (message.imageUrl) {
      const publicId = message.imageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`save-a-life/${publicId}`);
      }
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    await Message.updateMany(
      { roomId, senderType: 'visitor', read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};
