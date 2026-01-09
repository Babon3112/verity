import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return Response.json(
        {
          success: false,
          message: "Identifier and password are required",
        },
        { status: 400 }
      );
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Find user by email OR username
    const user = await userModel
      .findOne({
        $or: [
          { email: normalizedIdentifier },
          { username: normalizedIdentifier },
        ],
      })
      .select("+password");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "Please verify your account first",
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // ✅ Login successful
    return Response.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
