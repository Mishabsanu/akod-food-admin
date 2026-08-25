import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendSuccess, sendError } from '@/lib/response';
import { generateAdminTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return sendError('Invalid credentials', 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError('Invalid credentials', 400);
    }

    const { accessToken, refreshToken } = generateAdminTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    const response = sendSuccess({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, 'Authority access granted');

    response.cookies.set('token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60,
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return sendError(error, 500);
  }
}
