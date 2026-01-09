import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";
import FollowModel from "@/models/follow.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user._id;

    // pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 20);
    const skip = (page - 1) * limit;

    // users you follow
    const following = await FollowModel.find({ follower: userId })
      .select("following")
      .lean();

    const followingIds = following.map((f) => f.following);

    const posts = await PostModel.find({
      isDeleted: false,
      $or: [
        { visibility: "public" },
        {
          visibility: "followers",
          author: { $in: followingIds },
        },
        {
          visibility: "private",
          author: userId,
        },
      ],
    })
      .populate("author", "username avatar fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        posts,
        page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FEED_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
