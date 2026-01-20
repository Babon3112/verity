import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";
import UserModel from "@/models/user.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim().toLowerCase();
    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username: username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const posts = await PostModel.find({
      author: user._id,
    })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    return NextResponse.json(
      {
        success: true,
        posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FETCH_USER_POSTS_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
