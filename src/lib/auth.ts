import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { UnauthorizedError } from './errors';
import { AuthenticatedUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter-hackathon-super-secure-jwt-secret-key-2026';
const TOKEN_EXPIRY = '7d';
export const AUTH_COOKIE_NAME = 'gt_session_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeaderOrCookie(request: Request): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${AUTH_COOKIE_NAME}=`)) {
        return cookie.substring(AUTH_COOKIE_NAME.length + 1);
      }
    }
  }

  return null;
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const token = extractTokenFromHeaderOrCookie(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      currency: true,
      language: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    currency: user.currency,
    language: user.language,
  };
}

export async function requireAuth(request: Request): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new UnauthorizedError('Authentication required to access this endpoint');
  }
  return user;
}
