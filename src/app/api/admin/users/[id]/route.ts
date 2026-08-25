import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const user = await User.findById(params.id).select('-password -refreshToken').lean();
    if (!user) return sendError('User not found', 404);

    return sendSuccess(user, 'User data retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { name, email, role, status, password } = await req.json();
    const user = await User.findById(params.id);
    if (!user) return sendError('User not found', 404);

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password;

    await user.save();
    return sendSuccess(user, 'User updated successfully');
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const user = await User.findByIdAndDelete(params.id);
    if (!user) return sendError('Authority node not found', 404);

    return sendSuccess(null, 'Authority node terminated');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
