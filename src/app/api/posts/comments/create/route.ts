import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/comment.model";
import PostModel from "@/models/post.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(request: Request) {
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

    const postId = body?.postId?.trim();
    const content = body?.content?.trim();
    const parentComment = body?.parentComment?.trim() || null;

    if (!postId || !content) {
      return NextResponse.json(
        { success: false, message: "postId and content are required" },
        { status: 400 }
      );
    }

    const postExists = await PostModel.exists({ _id: postId });
    if (!postExists) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    // if reply: check parent comment exists & belongs to same post
    if (parentComment) {
      const parent = await CommentModel.findOne({
        _id: parentComment,
        post: postId,
      });

      if (!parent) {
        return NextResponse.json(
          { success: false, message: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await CommentModel.create({
      post: postId,
      author: session.user._id,
      content,
      parentComment,
    });

    // increase commentsCount on Post
    await PostModel.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment added",
        commentId: comment._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("COMMENT_CREATE_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
