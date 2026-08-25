import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'akod_super_secret_jwt_key_2026';

export interface TokenAdminUser {
  id: string;
}

export function generateAdminTokens(userId: string | object) {
  const idStr = userId.toString();
  const accessToken = jwt.sign({ id: idStr }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: idStr }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function verifyAdminToken(token: string): TokenAdminUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenAdminUser;
  } catch (error) {
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest): TokenAdminUser | null {
  const authHeader = req.headers.get('Authorization');
  let token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    token = req.cookies.get('token')?.value;
  }

  if (!token) return null;
  return verifyAdminToken(token);
}
