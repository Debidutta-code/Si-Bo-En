import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { cloudinary } from '../../utils/cloudinary';
import { errorResponse, successResponse } from '../../utils/return';
import fs from 'fs/promises'; 

export const uploadHandler = async (req: CustomRequest, res: Response) => {
  const files = req.files;
  const cloudinaryFolderName =
    process.env.CLOUDINARY_FOLDER_NAME || 'RevChill-Images';

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json(errorResponse('Upload at least one file'));
  }

  try {
    const uploadPromiseArray = files.map(file => {
      return cloudinary.uploader.upload(file.path, {
        folder: cloudinaryFolderName,
      });
    });

    const cloudinaryRes = await Promise.all(uploadPromiseArray);
    const urls = cloudinaryRes.map(singleUploadRes => singleUploadRes.url);

    return res
      .status(200)
      .json(successResponse('Files uploaded successfully', urls));
  } catch (err: any) {
    console.error('Cloudinary upload failed:', err);
    return res
      .status(500)
      .json(errorResponse('Failed to upload images', err?.message));
  } finally {
    if (files && Array.isArray(files)) {
      //console.log('Cleaning up temporary files...');
      
      const unlinkPromises = files.map(file => fs.unlink(file.path));

      try {
        const results = await Promise.allSettled(unlinkPromises);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Failed to delete temporary file: ${files[index].path}`, result.reason);
          }
        });
      } catch (cleanupErr) {
        console.error('Error during file cleanup:', cleanupErr);
      }
    }
  }
};