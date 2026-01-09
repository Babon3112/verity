import { sendForgotPasswordEmail } from "@/helper/sendEmail";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const identifier = body?.identifier?.trim().toLowerCase();
    const resetPasswordUrl = body?.resetPasswordUrl?.trim();

    if (!identifier || !resetPasswordUrl) {
      return Response.json(
        {
          success: false,
          message: "Missing identifier or reset password URL",
        },
        { status: 400 }
      );
    }

    const user = await userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    // Do not reveal whether user exists (prevents user enumeration)
    if (!user || !user.isVerified) {
      return Response.json(
        {
          success: true,
          message:
            "If an account exists, a reset password email has been sent",
        },
        { status: 200 }
      );
    }

    const resetPasswordCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000);

    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordExpiry = resetPasswordExpiry;

    await user.save();

    const emailResponse = await sendForgotPasswordEmail(
      user.email,
      resetPasswordCode,
      resetPasswordUrl
    );

    if (!emailResponse?.success) {
      console.error("Forgot password email failed:", emailResponse);
      return Response.json(
        {
          success: false,
          message: "Failed to send reset password email",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "If an account exists, a reset password email has been sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
