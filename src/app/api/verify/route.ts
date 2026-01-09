import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const username = body?.username?.trim()?.toLowerCase();
    const verifyCode = body?.verifyCode?.trim();

    if (!username || !verifyCode) {
      return Response.json(
        { success: false, message: "Username and verification code are required" },
        { status: 400 }
      );
    }

    const user = await userModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        { success: false, message: "User already verified" },
        { status: 409 }
      );
    }

    if (
      !user.verifyCode ||
      !user.verifyCodeExpiry ||
      user.verifyCodeExpiry < new Date()
    ) {
      return Response.json(
        { success: false, message: "Verification code expired" },
        { status: 400 }
      );
    }

    if (user.verifyCode !== verifyCode) {
      return Response.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;

    await user.save();

    return Response.json(
      { success: true, message: "User verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("User verification failed:", error);

    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
