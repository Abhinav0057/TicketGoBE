import cloudinary from "cloudinary";
import { createReadStream } from "streamifier";
export const streamUpload = (buffer: any, folder: any): any => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: folder,
      },

      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    createReadStream(buffer).pipe(stream);
  });
};
