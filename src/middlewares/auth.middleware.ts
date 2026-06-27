import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ status: 'error', message: 'User account is suspended' });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, invalid token' });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && (req as any).user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ status: 'error', message: 'Not authorized as an admin' });
  }
};
