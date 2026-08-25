import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadFileToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { id } = await params;
    const product = await Product.findById(id).populate('category').lean();
    if (!product) return sendError('Product not found', 404);

    return sendSuccess(product, 'Product details established');
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';
    const updateData: any = {};
    const newUploadedImages: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'images' || key === 'images[]') {
          if (value instanceof File && value.size > 0) {
            try {
              const url = await uploadFileToCloudinary(value, 'akod-food/products');
              newUploadedImages.push(url);
            } catch (err) {
              console.error('[CLOUD-UPLOAD] Product image upload error:', err);
            }
          }
        } else if (key === 'existingImages') {
          try {
            updateData.existingImages = JSON.parse(value as string);
          } catch {
            updateData.existingImages = [];
          }
        } else if (key === 'variants') {
          try {
            updateData[key] = JSON.parse(value as string);
          } catch {
            // ignore
          }
        } else if (key === 'nutritionalInfo' || key === 'tags') {
          try {
            updateData[key] = JSON.parse(value as string);
          } catch {
            updateData[key] = value;
          }
        } else {
          updateData[key] = value;
        }
      }
    } else {
      const body = await req.json();
      Object.assign(updateData, body);
    }

    let finalImages: string[] = [];
    if (updateData.existingImages) {
      finalImages = Array.isArray(updateData.existingImages) ? updateData.existingImages : [];
      delete updateData.existingImages;
    } else {
      const currentProduct = await Product.findById(id).lean();
      finalImages = currentProduct?.images || [];
    }

    if (newUploadedImages.length > 0) {
      updateData.images = [...finalImages, ...newUploadedImages];
    } else if (updateData.images) {
      // Body supplied images
    } else {
      updateData.images = finalImages;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!product) return sendError('Product not found', 404);

    return sendSuccess(product, 'Product updated successfully.');
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
    const product = await Product.findByIdAndDelete(id);
    if (!product) return sendError('Product not found', 404);

    return sendSuccess(null, 'Inventory node terminated');
  } catch (error: any) {
    return sendError(error, 500);
  }
}
