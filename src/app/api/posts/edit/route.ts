import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";
import { uploadOnCloudinary } from "@/lib/mediaUploader";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const postId = formData.get("postId")?.toString();
    const content = formData.get("content")?.toString().trim();
    const visibility = formData.get("visibility")?.toString();
    const existingMediaRaw = formData.get("existingMedia")?.toString();
    const hideLikesCount =
      formData.get("hideLikesCount")?.toString() === "true";
    const disableComments =
      formData.get("disableComments")?.toString() === "true";

    const files = formData.getAll("media") as File[];

    if (!postId) {
      return NextResponse.json(
        { message: "Post ID required" },
        { status: 400 }
      );
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    // Ownership check
    if (post.author.toString() !== session.user._id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!content) {
      return NextResponse.json(
        { message: "Content cannot be empty" },
        { status: 400 }
      );
    }

    const allowedVisibility = ["public", "followers", "private"];
    if (!visibility || !allowedVisibility.includes(visibility)) {
      return NextResponse.json(
        { message: "Invalid visibility value" },
        { status: 400 }
      );
    }

    const MAX_FILES = 4;
    const MAX_SIZE = 5 * 1024 * 1024;

    let existingMedia: any[] = [];
    if (existingMediaRaw) {
      try {
        existingMedia = JSON.parse(existingMediaRaw);
      } catch {
        return NextResponse.json(
          { message: "Invalid media format" },
          { status: 400 }
        );
      }
    }

    // Limit total media count
    if (existingMedia.length + files.length > MAX_FILES) {
      return NextResponse.json(
        { message: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    // Validate file size
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { message: "Each file must be under 5MB" },
          { status: 400 }
        );
      }
    }

    // Upload new files
    const newMedia = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const type = file.type.startsWith("video") ? "video" : "image";

      const uploaded = await uploadOnCloudinary(
        buffer,
        `verity/posts/${type}s`,
        type
      );

      newMedia.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: uploaded.resourceType,
      });
    }

    // Update post
    post.content = content;
    post.visibility = visibility;
    post.hideLikesCount = hideLikesCount;
    post.disableComments = disableComments;
    post.media = [...existingMedia, ...newMedia];

    await post.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Update Post Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
