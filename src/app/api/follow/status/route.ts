import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import UserModel from "@/models/user.model";
import FollowModel from "@/models/follow.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return Response.json({ success: true, following: false });
    }

    const { searchParams } = new URL(request.url);
    const rawUserName = searchParams.get("username");

    if (!rawUserName || rawUserName.trim().length < 3) {
      return Response.json({ success: true, following: false });
    }

    const username = rawUserName.trim().toLowerCase();

    const targetUser = await UserModel.findOne({ username });

    if (!targetUser) {
      return Response.json({ success: true, following: false });
    }

    const exists = await FollowModel.exists({
      follower: session.user._id,
      following: targetUser._id,
    });

    return Response.json({
      success: true,
      following: Boolean(exists),
    });
  } catch (error) {
    console.error("FOLLOW_STATUS_ERROR:", error);

    return Response.json(
      { success: false, following: false },
      { status: 500 }
    );
  }
}
