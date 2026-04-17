import { v2 as cloudinary } from "cloudinary";
import config from "./env.config";

cloudinary.config({
  cloud_name: config.cloudinaryName!,
  api_key: config.cloudinaryKey!,
  api_secret: config.cloudinarySecrete!,
});

export  {cloudinary};