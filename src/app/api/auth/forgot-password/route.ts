import { NextRequest } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    forgotPasswordSchema.parse(body);

    // Secure design requirement: Do not reveal whether email exists, return identical safe message
    return apiSuccess(
      { sent: true },
      'If an account exists with this email, password reset instructions have been dispatched.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
