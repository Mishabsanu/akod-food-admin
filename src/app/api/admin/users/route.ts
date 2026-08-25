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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};
    if (search) {
      mongoQuery.name = { $regex: search, $options: 'i' };
    }

    const sortOptions: any = { [sort]: order === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      User.find(mongoQuery)
        .select('-password -refreshToken')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(mongoQuery),
    ]);

    return sendSuccess({ data, total, page, pages: Math.ceil(total / limit) }, 'Authority ledger retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
