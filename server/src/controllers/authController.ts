import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/db.js';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
      return;
    }

    const isValid = db.verifyPassword(user.id, password);
    if (!isValid) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    db.logAction('USER_LOGIN', 'user', user.id, { email: user.email, role: user.role }, user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  },

  me: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Not authenticated.' });
      return;
    }

    const user = db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'User record not found.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  },
};
