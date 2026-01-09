import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/helper/sendEmail";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    const requiredFields = [
      "fullName",
      "username",
      "email",
      "password",
      "dateOfBirth",
      "gender",
      "verifyUrl",
    ] as const;

    const data: Record<(typeof requiredFields)[number], string> =
      {} as Record<(typeof requiredFields)[number], string>;

    for (const field of requiredFields) {
      const value = formData.get(field);
      if (typeof value !== "string" || !value.trim()) {
        return Response.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
      data[field] = value.trim();
    }

    const normalizedUsername = data.username.toLowerCase();
    const normalizedEmail = data.email.toLowerCase();

    const existingUser = await userModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    // Block if already verified
    if (existingUser?.isVerified) {
      return Response.json(
        { success: false, message: "Email or username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Existing but not verified → update
    if (existingUser) {
      Object.assign(existingUser, {
        fullName: data.fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender.toLowerCase(),
        verifyCode,
        verifyCodeExpiry,
      });

      await existingUser.save();
    } else {
      // New user
      await userModel.create({
        fullName: data.fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender.toLowerCase(),
        isVerified: false,
        verifyCode,
        verifyCodeExpiry,
      });
    }

    const emailResponse = await sendVerificationEmail(
      normalizedEmail,
      normalizedUsername,
      verifyCode,
      data.verifyUrl
    );

    if (!emailResponse?.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse?.message || "Failed to send verification email",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: existingUser
          ? "Account updated. Verification email resent."
          : "User registered successfully",
      },
      { status: existingUser ? 200 : 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
