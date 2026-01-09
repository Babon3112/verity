import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const rawUserName = searchParams.get("username");

    if (!rawUserName || rawUserName.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Valid username is required" },
        { status: 400 }
      );
    }

    const username = rawUserName.trim().toLowerCase();

    const user = await UserModel.findOne({
      username,
      isBlocked: false,
    }).select(
      "-password -verifyCode -verifyCodeExpiry -resetPasswordCode -resetPasswordExpiry"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("PROFILE_FETCH_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
