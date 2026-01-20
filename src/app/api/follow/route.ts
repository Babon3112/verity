import dbConnect from "@/lib/dbConnect";
import FollowModel from "@/models/follow.model";
import UserModel from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server";

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
    const followingUserName = body?.followingUserName?.trim().toLowerCase();

    if (!followingUserName) {
      return NextResponse.json(
        { success: false, message: "Target username required" },
        { status: 400 }
      );
    }

    const followerId = session.user._id;

    const followingUser = await UserModel.findOne({
      username: followingUserName,
      isBlocked: false,
    });

    if (!followingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (followingUser._id.equals(followerId)) {
      return NextResponse.json(
        { success: false, message: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    const existingFollow = await FollowModel.findOne({
      follower: followerId,
      following: followingUser._id,
    });

    // 🔁 UNFOLLOW
    if (existingFollow) {
      await FollowModel.deleteOne({ _id: existingFollow._id });

      await Promise.all([
        UserModel.findByIdAndUpdate(followerId, {
          $inc: { followingCount: -1 },
        }),
        UserModel.findByIdAndUpdate(followingUser._id, {
          $inc: { followersCount: -1 },
          $max: { likesCount: 0 },
        }),
      ]);

      return NextResponse.json(
        { success: true, action: "unfollowed" },
        { status: 200 }
      );
    }

    // ➕ FOLLOW
    await FollowModel.create({
      follower: followerId,
      following: followingUser._id,
    });

    await Promise.all([
      UserModel.findByIdAndUpdate(followerId, {
        $inc: { followingCount: 1 },
      }),
      UserModel.findByIdAndUpdate(followingUser._id, {
        $inc: { followersCount: 1 },
      }),
    ]);

    return NextResponse.json(
      { success: true, action: "followed" },
      { status: 201 }
    );
  } catch (error) {
    console.error("FOLLOW_TOGGLE_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
