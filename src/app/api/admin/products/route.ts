import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category';
import { sendSuccess, sendError } from '@/lib/response';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadFileToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const [data, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return sendSuccess({ data, total, page, pages: Math.ceil(total / limit) }, 'Inventory ledger retrieved');
  } catch (error: any) {
    return sendError(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(req);
    if (!admin) return sendError('Unauthorized', 401);

    const contentType = req.headers.get('content-type') || '';
    const productData: any = {};
    const uploadedImages: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'images' || key === 'images[]') {
          if (value instanceof File && value.size > 0) {
            try {
              const url = await uploadFileToCloudinary(value, 'akod-food/products');
              uploadedImages.push(url);
            } catch (err) {
              console.error('[CLOUD-UPLOAD] Product image upload error:', err);
            }
          }
        } else if (key === 'variants') {
          try {
            productData[key] = JSON.parse(value as string);
          } catch {
            productData[key] = [];
          }
        } else if (key === 'nutritionalInfo' || key === 'tags') {
          try {
            productData[key] = JSON.parse(value as string);
          } catch {
            productData[key] = value;
          }
        } else {
          productData[key] = value;
        }
      }
    } else {
      const body = await req.json();
      Object.assign(productData, body);
      if (Array.isArray(body.images)) {
        uploadedImages.push(...body.images);
      }
    }

    if (uploadedImages.length > 0) {
      productData.images = uploadedImages;
    } else if (!productData.images || productData.images.length === 0) {
      productData.images = ['https://res.cloudinary.com/dwkom79iv/image/upload/v1715096530/akod-food/placeholder.png'];
    }

    const product = new Product(productData);
    await product.save();

    return sendSuccess(product, 'Product created successfully', 201);
  } catch (error: any) {
    return sendError(error, 500);
  }
}
