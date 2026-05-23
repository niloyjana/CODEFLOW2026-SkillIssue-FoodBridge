import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err: any) {
    console.error('Authentication error:', err.message || err);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
