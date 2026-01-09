// lib/mediaUploader.ts
import cloudinary from "@/lib/cloudinary";
import sharp from "sharp";

export type MediaType = "image" | "video";

export interface UploadResponse {
  url: string;
  publicId: string;
  resourceType: MediaType;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadOnCloudinary = async (
  buffer: Buffer,
  folder: string,
  type: MediaType
): Promise<UploadResponse> => {
  if (!buffer) {
    throw new Error("No file buffer provided");
  }

  if (!folder) {
    throw new Error("Cloudinary folder is required");
  }

  if (type === "image" && buffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Image size exceeds 5MB");
  }

  if (type === "video" && buffer.length > MAX_VIDEO_SIZE) {
    throw new Error("Video size exceeds 50MB");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: type,
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new Error(error?.message || "Cloudinary upload failed")
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type as MediaType,
        });
      }
    );

    try {
      if (type === "image") {
        sharp(buffer)
          .rotate()
          .resize(1080, undefined, { withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .pipe(uploadStream);
      } else {
        uploadStream.end(buffer);
      }
    } catch (err: any) {
      reject(new Error(err.message || "Media processing failed"));
    }
  });
};
