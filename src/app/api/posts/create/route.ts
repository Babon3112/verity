import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";
import { uploadOnCloudinary } from "@/lib/mediaUploader";
import UserModel from "@/models/user.model";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const content = formData.get("content")?.toString().trim();
  const visibility = formData.get("visibility")?.toString() || "public";
  const files = formData.getAll("media") as File[];

  if (!content) {
    return NextResponse.json(
      { message: "Post content is required" },
      { status: 400 }
    );
  }

  let media = [];

const MAX_FILES = 4;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (files && files.length > 0) {

  // 1️⃣ Limit number of files
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { message: `Maximum ${MAX_FILES} files allowed` },
      { status: 400 }
    );
  }

  // 2️⃣ Limit file size (ADD THIS HERE)
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "Each file must be under 5MB" },
        { status: 400 }
      );
    }
  }

  // 3️⃣ Only now upload
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const type = file.type.startsWith("video") ? "video" : "image";

    const uploaded = await uploadOnCloudinary(
      buffer,
      `verity/posts/${type}s`,
      type
    );

    media.push({
      url: uploaded.url,
      publicId: uploaded.publicId,
      type: uploaded.resourceType,
    });
  }
}

  const post = await PostModel.create({
    author: session.user._id,
    content,
    visibility,
    media,
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
}
