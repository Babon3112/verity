import dbConnect from "@/lib/dbConnect";
import LikeModel from "@/models/like.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return Response.json(
        { success: false, message: "postId is required" },
        { status: 400 },
      );
    }

    const exists = await LikeModel.exists({
      user: session.user._id,
      post: postId,
    });

    return Response.json(
      {
        success: true,
        liked: Boolean(exists),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("LIKE_STATUS_ERROR:", error);

    return Response.json(
      { success: false, message: "Internal server error", liked: false },
      { status: 500 },
    );
  }
}
