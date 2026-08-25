import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const user = await User.findById(admin.id).select('-password -refreshToken');
    if (!user) return sendError('Authority node not found', 404);

    return sendSuccess(user, 'Current authority verified');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
