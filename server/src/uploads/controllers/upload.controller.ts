import { CustomRequest } from '../../utils';
import { Response } from 'express';
import { IApiResponse, successResponse, errorResponse } from '../../utils';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { config, s3 } from '../../config';

export class UploadController {
    public async generatePresetUrl(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const { fileType } = req.body;

            if (!fileType) {
                return res
                    .status(400)
                    .json(errorResponse('fileType is required'));
            }

            const ext = fileType.split('/')[1] || 'jpg';

            const key = `Revchill-Images/${uuid()}.${ext}`;
            const command = new PutObjectCommand({
                Bucket: config.awsBucketName!,
                Key: key,
                ContentType: fileType,
            });

            const uploadUrl = await getSignedUrl(s3, command, {
                expiresIn: 60,
            });

            const fileUrl = `https://${config.awsBucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;

            return res.status(200).json(
                successResponse('Upload URL generated', {
                    uploadUrl,
                    fileUrl,
                    key,
                })
            );
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Preset Url Generation Failed',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Preset Url Generation Failed',
                        'Something went wrong'
                    )
                );
        }
    }
}
