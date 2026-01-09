import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username || username.trim().length < 3) {
      return Response.json(
        { success: false, available: false },
        { status: 400 }
      );
    }

    const normalizedUserName = username.trim().toLowerCase();

    const exists = await userModel.exists({
      username: normalizedUserName,
      isVerified: true,
    });

    return Response.json(
      {
        success: true,
        available: !exists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Username availability check failed:", error);

    return Response.json(
      { success: false, available: false },
      { status: 500 }
    );
  }
}
