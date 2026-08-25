import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { id } = await params;
    const { trackingId, courierName } = await req.json();
    const order = await Order.findById(id);
    if (!order) return sendError('Order not found', 404);

    order.shipment = {
      trackingId,
      courierName,
      shippedAt: new Date(),
    };
    order.status = 'shipped';

    await order.save();
    return sendSuccess(order, 'Shipment details updated and status changed to shipped');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
