import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Customer from '@/models/Customer';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { id } = await params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return sendError('Customer not found', 404);

    return sendSuccess(null, 'Customer identity permanently removed');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
