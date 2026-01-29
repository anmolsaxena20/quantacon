import cloudinary from "../config/cloudinary.config.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer, folder = "social_media") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};
