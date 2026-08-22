import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: db.user,
    message: 'User profile retrieved',
  });
}
