import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        homeCity: true,
        currency: true,
        language: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User account not found');
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
