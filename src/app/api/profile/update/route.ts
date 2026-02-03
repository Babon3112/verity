import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { uploadOnCloudinary } from "@/lib/mediaUploader";
import { deleteFromCloudinary } from "@/lib/mediaDeleter";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const fullName = formData.get("fullName")?.toString().trim();
    const username = formData.get("username")?.toString().toLowerCase().trim();
    const bio = formData.get("bio")?.toString().trim() || "";
    const dateOfBirth = formData.get("dateOfBirth")?.toString();
    const gender = formData.get("gender")?.toString().toLowerCase();
    const avatarFile = formData.get("avatar") as File | null;

    if (!fullName || !username || !dateOfBirth || !gender) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const usernameRegex = /^[a-z0-9._]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { success: false, message: "Invalid username format" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(session.user._id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* ================= USERNAME CHECK ================= */

    if (username !== user.username) {
      const existing = await UserModel.findOne({ username });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Username already taken" },
          { status: 409 }
        );
      }
    }

    /* ================= AVATAR REPLACEMENT ================= */

    if (avatarFile) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());

      // Upload new avatar
      const uploaded = await uploadOnCloudinary(
        buffer,
        "verity/avatars",
        "image"
      );

      // Delete old avatar if exists
      if (user.avatar) {
        try {
          // Extract publicId from URL
          const urlParts = user.avatar.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const publicId = `verity/avatars/${fileName.split(".")[0]}`;

          await deleteFromCloudinary(publicId, "image");
        } catch (err) {
          console.error("Old avatar deletion failed:", err);
          // Don't block update if deletion fails
        }
      }

      user.avatar = uploaded.url;
    }

    /* ================= UPDATE OTHER FIELDS ================= */

    user.fullName = fullName;
    user.username = username;
    user.bio = bio;
    user.dateOfBirth = new Date(dateOfBirth);
    user.gender = gender as "male" | "female" | "other";

    await user.save();

    const updatedUser = await UserModel.findById(user._id).select("-password");

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
