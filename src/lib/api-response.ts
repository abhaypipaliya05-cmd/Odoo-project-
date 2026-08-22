// Standardized API Response Helpers
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

export function apiSuccess<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse<ApiSuccessResponse<T>> {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    payload.message = message;
  }
  return NextResponse.json(payload, { status: statusCode });
}

export function apiError(
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: Array<{ field?: string; message: string }>
): NextResponse<ApiErrorResponse> {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status: statusCode });
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Re-throw Next.js dynamic server usage signals during build-time route discovery
  if (typeof error === 'object' && error !== null && 'digest' in error && (error as any).digest === 'DYNAMIC_SERVER_USAGE') {
    throw error;
  }

  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return apiError('Validation failed for the submitted payload', 400, 'VALIDATION_ERROR', details);
  }

  if (error instanceof AppError) {
    return apiError(error.message, error.statusCode, error.code, error.details);
  }

  const errMessage = error instanceof Error ? error.message : 'An unexpected server error occurred';
  console.error('[API_UNHANDLED_ERROR]:', error);
  return apiError(errMessage, 500, 'INTERNAL_ERROR');
}
