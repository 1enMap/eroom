import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';
import { nanoid } from './utils';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function registerUser(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = nanoid();

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword);

    db.prepare(`
      INSERT INTO user_stats (user_id)
      VALUES (?)
    `).run(userId);

    return { success: true };
  } catch (error) {
    if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export function verifyToken(token: string): AuthUser {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    throw new Error('Invalid token');
  }
}