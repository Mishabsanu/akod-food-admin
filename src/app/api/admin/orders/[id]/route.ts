import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { id } = await params;
    const { status } = await req.json();
    const order = await Order.findById(id);
    if (!order) return sendError('Order not found', 404);

    if (order.status === 'cancelled') {
      return sendError('Cannot update status of a cancelled order', 400);
    }

    order.status = status;
    if (status === 'cancelled' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'failed';
    }

    await order.save();
    return sendSuccess(order, `Order status updated to ${status}`);
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) return sendError('Order not found', 404);

    return sendSuccess(null, 'Order record terminated');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
