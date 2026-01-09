// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API route called successfully!");

    const body = await request.json();
    const { username, password } = body;

    console.log("📝 Login attempt for username:", username);
    console.log("📝 Password provided:", password ? "Yes" : "No");

    // Environment variables'dan oku (öncelikli)
    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log("🔍 Expected username:", validUsername);
    console.log("🔍 Expected password:", validPassword ? "***" : "Not set");

    // Trim ve string karşılaştırması
    if (
      username?.trim() === validUsername.trim() &&
      password?.trim() === validPassword.trim()
    ) {
      console.log("✅ Login successful!");
      return NextResponse.json({
        success: true,
        message: "Login successful",
      });
    } else {
      console.log("❌ Invalid credentials provided");
      console.log("Username match:", username?.trim() === validUsername.trim());
      console.log("Password match:", password?.trim() === validPassword.trim());

      return NextResponse.json(
        {
          success: false,
          message: "Kullanıcı adı veya şifre hatalı!",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("🚨 Login API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "GET method not allowed for login",
    },
    { status: 405 }
  );
}

// Test endpoint - geliştirme için
export async function OPTIONS() {
  return NextResponse.json({ message: "OPTIONS request successful" });
}
