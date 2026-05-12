import { cloudinary, config, s3 } from '../config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
export const deleteFileByUrl = async (fileUrl: string) => {
    if (!fileUrl) return;

    try {
        const url = new URL(fileUrl);
        const hostname = url.hostname;

        if (hostname.endsWith('amazonaws.com')) {
            return await deleteFromS3(fileUrl);
        }

        if (hostname.endsWith('cloudinary.com')) {
            return await deleteFromCloudinary(fileUrl);
        }

        console.warn('Unknown storage provider:', hostname);
    } catch (error) {
        console.error('Delete resolver error:', error);
    }
};

const deleteFromCloudinary = async (fileUrl: string) => {
    try {
        const url = new URL(fileUrl);
        const parts = url.pathname.split('/');

        const uploadIndex = parts.findIndex(p => p === 'upload');

        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL');
        }

        const publicIdParts = parts.slice(uploadIndex + 1);

        if (publicIdParts[0]?.startsWith('v')) {
            publicIdParts.shift();
        }

        const public_id = publicIdParts.join('/').replace(/\.[^/.]+$/, '');

        await cloudinary.uploader.destroy(public_id);

        // console.log("Deleted from Cloudinary:", public_id);
    } catch (error) {
        // console.error("Cloudinary delete error:", error);
    }
};

const deleteFromS3 = async (fileUrl: string) => {
    try {
        const url = new URL(fileUrl);

        const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));

        await s3.send(
            new DeleteObjectCommand({
                Bucket: config.awsBucketName!,
                Key: key,
            })
        );

        console.log('Deleted from S3:', key);
    } catch (error) {
        console.error('S3 delete error:', error);
    }
};
