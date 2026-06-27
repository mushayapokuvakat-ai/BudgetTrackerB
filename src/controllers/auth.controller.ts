import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, email, phone, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide all fields' });
    }

    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: phone || undefined }] }
    });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email or Phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        fullname,
        email,
        password_hash,
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ status: 'error', message: 'Account is suspended' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
