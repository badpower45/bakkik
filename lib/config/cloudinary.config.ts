import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Upload image to Cloudinary
 * @param imageData Base64 encoded image or buffer
 * @param folder Cloudinary folder (e.g., 'fighters', 'events')
 * @param publicId Optional public ID for the image
 * @returns Cloudinary upload result
 */
export async function uploadImage(
    imageData: string | Buffer,
    folder: string = 'general',
    publicId?: string
) {
    try {
        const options: any = {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1000, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        };

        if (publicId) {
            options.public_id = publicId;
        }

        // If imageData is a base64 string
        if (typeof imageData === 'string') {
            const result = await cloudinary.uploader.upload(imageData, options);
            return result;
        }

        // If imageData is a buffer, convert to base64
        const base64Image = `data:image/png;base64,${imageData.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64Image, options);
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteImage(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Get optimized image URL
 * @param publicId Image public ID
 * @param width Optional width
 * @param height Optional height
 * @returns Optimized URL
 */
export function getOptimizedUrl(
    publicId: string,
    width?: number,
    height?: number
): string {
    const transformations = [];

    if (width) {
        transformations.push(`w_${width}`);
    }

    if (height) {
        transformations.push(`h_${height}`);
    }

    transformations.push('c_fill', 'q_auto', 'f_auto');

    return cloudinary.url(publicId, {
        transformation: transformations,
        secure: true,
    });
}

export default cloudinary;
