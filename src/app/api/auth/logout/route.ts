import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/response';

export async function POST(req: NextRequest) {
  const response = sendSuccess(null, 'Logged out successfully');
  response.cookies.delete('token');
  response.cookies.delete('refreshToken');
  return response;
}
