// import { v2 as cloudinary } from "cloudinary";
// import { s3 } from ".";

// =
// export const deleteFileByUrl = async (fileUrl: string) => {
//   if (!fileUrl) return;

//   try {
//     const url = new URL(fileUrl);
//     const hostname = url.hostname;

//     if (hostname.includes("amazonaws.com")) {
//       return await deleteFromS3(fileUrl);
//     }

//     if (hostname.includes("cloudinary.com")) {
//       return await deleteFromCloudinary(fileUrl);
//     }

//     console.warn("Unknown storage provider:", hostname);
//   } catch (error) {
//     console.error("Delete resolver error:", error);
//   }
// };



// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export const deleteFromCloudinary = async (fileUrl: string) => {
//   try {
//     const url = new URL(fileUrl);

//     // Example:
//     // https://res.cloudinary.com/<cloud_name>/image/upload/v1234567/folder/file.jpg

//     const parts = url.pathname.split("/");

//     const uploadIndex = parts.findIndex(p => p === "upload");

//     // public_id = everything after "upload" excluding version
//     const publicIdParts = parts.slice(uploadIndex + 1);

//     // remove version (v123456)
//     if (publicIdParts[0]?.startsWith("v")) {
//       publicIdParts.shift();
//     }

//     const public_id = publicIdParts.join("/").replace(/\.[^/.]+$/, "");

//     await cloudinary.uploader.destroy(public_id);

//     console.log("Deleted from Cloudinary:", public_id);
//   } catch (error) {
//     console.error("Cloudinary delete error:", error);
//   }
// };

// export const deleteFromS3 = async (fileUrl: string) => {
//   try {
//     const url = new URL(fileUrl);

//     // Extract key (everything after bucket domain)
//     const key = decodeURIComponent(url.pathname.slice(1));

//     await s3.send(
//       new DeleteObjectCommand({
//         Bucket: process.env.AWS_BUCKET!,
//         Key: key,
//       })
//     );

//     console.log("Deleted from S3:", key);
//   } catch (error) {
//     console.error("S3 delete error:", error);
//   }
// };