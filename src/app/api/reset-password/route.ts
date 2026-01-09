import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const identifier = body?.identifier?.trim().toLowerCase();
    const resetPasswordCode = body?.resetPasswordCode?.trim();
    const password = body?.password;
    const confirmPassword = body?.confirmPassword;

    // 1. Validate input
    if (!identifier || !resetPasswordCode || !password || !confirmPassword) {
      return Response.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // 2. Find verified user
    const user = await userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
        isVerified: true,
      })
      .select("+password +resetPasswordCode +resetPasswordExpiry");

    if (!user || !user.resetPasswordCode) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired reset request",
        },
        { status: 400 }
      );
    }

    // 3. Check expiry
    if (
      !user.resetPasswordExpiry ||
      user.resetPasswordExpiry < new Date()
    ) {
      return Response.json(
        { success: false, message: "Reset code expired" },
        { status: 401 }
      );
    }

    // 4. Validate reset code
    if (user.resetPasswordCode !== resetPasswordCode) {
      return Response.json(
        { success: false, message: "Invalid reset code" },
        { status: 401 }
      );
    }

    // 5. Prevent password reuse
    const isSamePassword = await bcrypt.compare(
      password,
      user.password
    );

    if (isSamePassword) {
      return Response.json(
        {
          success: false,
          message:
            "New password must be different from the old password",
        },
        { status: 400 }
      );
    }

    // 6. Hash & save new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    return Response.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
