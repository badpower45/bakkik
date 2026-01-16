import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { successResponse } from '@/lib/utils/response';
import { withErrorHandler, ValidationError } from '@/lib/middleware/error';
import { uploadBuffer } from '@/lib/services/cloudinary.service';

export const runtime = 'nodejs';

/**
 * POST /api/admin/uploads
 * Upload one or more images to Cloudinary (admin only)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const folder = (formData.get('folder') as string | null) || 'uploads';

  const files = formData.getAll('files');
  const singleFile = formData.get('file');
  const uploadFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

  if (uploadFiles.length === 0) {
    throw new ValidationError('No files provided');
  }

  const uploaded = [];

  for (const file of uploadFiles) {
    if (!(file instanceof File)) {
      throw new ValidationError('Invalid file payload');
    }
    if (!file.type.startsWith('image/')) {
      throw new ValidationError('Only image uploads are supported');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBuffer({
      buffer,
      folder,
      filename: file.name,
      resourceType: 'image',
    });

    uploaded.push(result);
  }

  return successResponse(
    {
      files: uploaded,
      urls: uploaded.map((item) => item.url),
    },
    201
  );
});
