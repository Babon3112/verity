import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
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

    const post = await PostModel.findById(postId)
      .populate("author", "username fullName avatar")
      .lean();

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, post },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET_SINGLE_POST_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
