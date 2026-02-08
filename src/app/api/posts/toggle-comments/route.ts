import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/models/post.model";

export async function PUT(req: Request) {
  await dbConnect();
  const { postId } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session?.user?._id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const post = await PostModel.findById(postId);
  if (!post)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (post.author.toString() !== session.user._id)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  post.disableComments = !post.disableComments;
  await post.save();

  return NextResponse.json({ success: true });
}
