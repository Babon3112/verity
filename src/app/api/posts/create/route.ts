import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";
import { uploadOnCloudinary } from "@/lib/mediaUploader";
import UserModel from "@/models/user.model";

const MAX_FILES = 4;

export async function POST(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const content = formData.get("content")?.toString().trim() || "";
    const visibility =
      formData.get("visibility")?.toString() || "public";

    const hideLikesCount =
      formData.get("hideLikesCount")?.toString() === "true";

    const disableComments =
      formData.get("disableComments")?.toString() === "true";

    const files = formData.getAll("media") as File[];

    if (!content && files.length === 0) {
      return NextResponse.json(
        { message: "Post must contain text or media" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { message: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

   for (const file of files) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { message: "Only images and videos are allowed" },
      { status: 400 }
    );
  }

  if (isImage && file.size > 15 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Images must be under 15MB" },
      { status: 400 }
    );
  }

  if (isVideo && file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Videos must be under 50MB" },
      { status: 400 }
    );
  }
}


    // 🔥 Parallel upload for ALL media (images + videos)
    const media =
      files.length > 0
        ? await Promise.all(
            files.map(async (file) => {
              const buffer = Buffer.from(
                await file.arrayBuffer()
              );

              const type: "image" | "video" =
                file.type.startsWith("video/")
                  ? "video"
                  : "image";

              const uploaded = await uploadOnCloudinary(
                buffer,
                `verity/posts/${type}s`,
                type
              );

              return {
                url: uploaded.url,
                publicId: uploaded.publicId,
                type,
              };
            })
          )
        : [];

    const post = await PostModel.create({
      author: session.user._id,
      content,
      visibility,
      media,
      hideLikesCount,
      disableComments,
    });

    await UserModel.findByIdAndUpdate(session.user._id, {
      $inc: { postsCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        postId: post._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Create Post Error:", error);

    return NextResponse.json(
      { message: "Failed to create post" },
      { status: 500 }
    );
  }
}
