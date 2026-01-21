import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/comment.model";
import PostModel from "@/models/post.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const commentId = body?.commentId?.trim();

    if (!commentId) {
      return NextResponse.json(
        { success: false, message: "commentId is required" },
        { status: 400 }
      );
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    // Only author can delete
    if (comment.author.toString() !== session.user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const postId = comment.post;

    // delete comment + replies
    const deleteResult = await CommentModel.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });

    // decrease commentsCount by deleted count
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -deleteResult.deletedCount },
    });

    return NextResponse.json(
      { success: true, message: "Comment deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("COMMENT_DELETE_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
