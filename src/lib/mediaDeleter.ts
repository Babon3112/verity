// lib/mediaDeleter.ts
import cloudinary from "@/lib/cloudinary";
import { MediaType } from "./mediaUploader";

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: MediaType
) => {
  if (!publicId) {
    throw new Error("Public ID is required for deletion");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Failed to delete media from Cloudinary");
  }

  return result;
};
