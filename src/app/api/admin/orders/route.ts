import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import '@/models/Customer';
import '@/models/Product';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(orders, 'Order registry retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
