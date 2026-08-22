import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validation';
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
        _count: {
          select: {
            trips: true,
            savedDestinations: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    // Strictly disallow updating id, email, role, or passwordHash through profile update
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.avatarUrl !== undefined && { avatarUrl: validated.avatarUrl }),
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.homeCity !== undefined && { homeCity: validated.homeCity }),
        ...(validated.currency !== undefined && { currency: validated.currency }),
        ...(validated.language !== undefined && { language: validated.language }),
      },
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

    return apiSuccess(updatedUser, 'Profile updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
