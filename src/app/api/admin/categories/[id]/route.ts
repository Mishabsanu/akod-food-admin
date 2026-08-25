import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadFileToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const category = await Category.findById(params.id).lean();
    if (!category) return sendError('Classification node not found', 404);

    return sendSuccess(category, 'Classification node retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const contentType = req.headers.get('content-type') || '';
    const updateData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const name = formData.get('name');
      const description = formData.get('description');
      const imageFile = formData.get('image') as File | null;

      if (name) updateData.name = name;
      if (description !== null) updateData.description = description;

      if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
        try {
          updateData.image = await uploadFileToCloudinary(imageFile, 'akod-food/categories');
        } catch (uploadErr) {
          console.error('[CLOUD-UPLOAD] Category update upload failed:', uploadErr);
        }
      }
    } else {
      const body = await req.json();
      Object.assign(updateData, body);
    }

    const category = await Category.findByIdAndUpdate(params.id, updateData, { new: true }).lean();
    if (!category) return sendError('Category not found', 404);

    return sendSuccess(category, 'Classification node updated successfully.');
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return sendError('Category not found', 404);

    return sendSuccess(null, 'Classification node terminated');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
