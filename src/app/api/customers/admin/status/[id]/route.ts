import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Customer from '@/models/Customer';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const customer = await Customer.findById(params.id);
    if (!customer) return sendError('Customer not found', 404);

    customer.status = customer.status === 'Active' ? 'Blocked' : 'Active';
    await customer.save();

    return sendSuccess(
      customer,
      `Customer ${customer.status === 'Blocked' ? 'suspended' : 'activated'} successfully`
    );
  } catch (error: any) {
    return sendError(error, 500);
  }
}
