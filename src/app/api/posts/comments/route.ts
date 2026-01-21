import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/comment.model";
import PostModel from "@/models/post.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId")?.trim();

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "postId is required" },
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

    const allComments = await CommentModel.find({ post: postId })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: 1 })
      .lean();

    // Thread format
    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const c of allComments) {
      map.set(c._id.toString(), { ...c, replies: [] });
    }

    for (const c of allComments) {
      const id = c._id.toString();

      if (!c.parentComment) {
        roots.push(map.get(id));
        continue;
      }

      const parentId = c.parentComment.toString();
      const parent = map.get(parentId);

      if (parent) {
        parent.replies.push(map.get(id));
      } else {
        roots.push(map.get(id));
      }
    }

    return NextResponse.json(
      { success: true, comments: roots },
      { status: 200 }
    );
  } catch (error) {
    console.error("COMMENT_FETCH_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
