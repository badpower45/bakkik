import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/lib/config/cloudinary.config';
import { verifyAdmin } from '@/lib/middleware/auth';

/**
 * POST /api/admin/upload/image
 * Upload image to Cloudinary
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = await verifyAdmin(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { image, folder = 'general', publicId } = body;

        // Validate request
        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // Validate folder name (security)
        const validFolders = [
            'fighters',
            'events',
            'academies',
            'media',
            'news',
            'banners',
            'general',
        ];

        if (!validFolders.includes(folder)) {
            return NextResponse.json(
                { error: 'Invalid folder name' },
                { status: 400 }
            );
        }

        // Validate image format (base64)
        if (!image.startsWith('data:image/')) {
            return NextResponse.json(
                { error: 'Invalid image format. Must be base64 encoded' },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const result = await uploadImage(image, folder, publicId);

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        });
    } catch (error: any) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/upload/image
 * Delete image from Cloudinary
 */
export async function DELETE(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = await verifyAdmin(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const publicId = searchParams.get('publicId');

        if (!publicId) {
            return NextResponse.json(
                { error: 'Public ID is required' },
                { status: 400 }
            );
        }

        // Delete from Cloudinary
        const result = await deleteImage(publicId);

        return NextResponse.json({
            success: true,
            result: result.result, // 'ok' or 'not found'
        });
    } catch (error: any) {
        console.error('Image delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete image' },
            { status: 500 }
        );
    }
}
