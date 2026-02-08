import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";
import UserModel from "@/models/user.model";
import { deleteFromCloudinary } from "@/lib/mediaDeleter";

export async function DELETE(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ message: "Post ID required" }, { status: 400 });
  }

  const post = await PostModel.findById(postId);
  if (!post) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  // Ownership check
  if (post.author.toString() !== session.user._id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  /* ================= DELETE MEDIA ================= */

  if (post.media && post.media.length > 0) {
    for (const item of post.media) {
      try {
        await deleteFromCloudinary(item.publicId, item.type);
      } catch (err) {
        console.error("Cloudinary deletion failed:", err);
      }
    }
  }

  /* ================= DELETE POST ================= */

  await PostModel.findByIdAndDelete(postId);

  /* ================= UPDATE USER ================= */

  await UserModel.findByIdAndUpdate(session.user._id, {
    $inc: { postsCount: -1 },
  });

  return NextResponse.json({ success: true });
}
