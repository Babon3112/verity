import dbConnect from "@/lib/dbConnect";
import LikeModel from "@/models/like.model";
import PostModel from "@/models/post.model";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user._id;
    const { postId } = await request.json();

    if (!postId) {
      return Response.json(
        { success: false, message: "PostId required" },
        { status: 400 },
      );
    }

    const targetPost = await PostModel.findOne({ _id: postId });

    if (!targetPost) {
      return Response.json(
        { success: false, message: "Post not found" },
        { status: 404 },
      );
    }

    const existingLike = await LikeModel.findOne({
      user:userId,
      post:postId,
    });

    if (existingLike) {
      await LikeModel.deleteOne({ _id: existingLike._id });

      await PostModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: -1 },
      });

      return Response.json(
        { success: true, message: "Unliked" },
        { status: 200 },
      );
    }

    await LikeModel.create({ user:userId, post:postId });

    await PostModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    return Response.json({ success: true, message: "Liked" }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
