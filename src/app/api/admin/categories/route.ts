import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      Category.find(query).skip(skip).limit(limit).lean(),
      Category.countDocuments(query),
    ]);

    return sendSuccess({ data, total, page, pages: Math.ceil(total / limit) }, 'Classification ledger retrieved');
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
    let name = '';
    let description = '';
    let imageUrl = 'https://res.cloudinary.com/dwkom79iv/image/upload/v1715096530/akod-food/placeholder.png';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = formData.get('name') as string;
      description = (formData.get('description') as string) || '';
      const imageFile = formData.get('image') as File | null;

      if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
        try {
          imageUrl = await uploadFileToCloudinary(imageFile, 'akod-food/categories');
        } catch (uploadErr) {
          console.error('[CLOUD-UPLOAD] Category upload failed:', uploadErr);
        }
      }
    } else {
      const body = await req.json();
      name = body.name;
      description = body.description || '';
      if (body.image) imageUrl = body.image;
    }

    if (!name) {
      return sendError('Category name is required', 400);
    }

    const category = new Category({ name, description, image: imageUrl });
    await category.save();

    return sendSuccess(category, 'Classification node finalized', 201);
  } catch (error: any) {
    return sendError(error, 500);
  }
}
