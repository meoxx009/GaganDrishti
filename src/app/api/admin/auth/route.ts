import { NextRequest, NextResponse } from "next/server";
import {
  findAdminByEmail,
  verifyPassword,
  generate2FACode,
  verify2FACode,
  createAdminSession,
  validateAdminSession,
  invalidateAdminSession,
  ADMIN_USERS,
} from "@/lib/admin/adminDatabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Password Step
    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Government email and password are required" },
          { status: 400 }
        );
      }

      const user = findAdminByEmail(email);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials or unauthorized email domain" },
          { status: 401 }
        );
      }

      if (!verifyPassword(user, password)) {
        return NextResponse.json(
          { success: false, error: "Invalid password attempt" },
          { status: 401 }
        );
      }

      if (!user.active) {
        return NextResponse.json(
          { success: false, error: "Account deactivated. Contact State IT Cell." },
          { status: 403 }
        );
      }

      // Generate 2FA code
      const code = generate2FACode(user.email);
      const maskedPhone = user.phone.slice(0, 2) + "******" + user.phone.slice(-2);

      return NextResponse.json({
        success: true,
        two_factor_required: true,
        email: user.email,
        phone_masked: maskedPhone,
        demo_code: code, // Provided for instant demo/testing evaluation
        message: `OTP sent via SMS to +91-${maskedPhone}. Valid for 10 minutes.`,
      });
    }

    // 2. 2FA Verification Step
    if (action === "verify_2fa") {
      const { email, code } = body;
      if (!email || !code) {
        return NextResponse.json(
          { success: false, error: "Email and 2FA code are required" },
          { status: 400 }
        );
      }

      const user = findAdminByEmail(email);
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Admin account not found" },
          { status: 404 }
        );
      }

      const isValid = verify2FACode(email, code);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired 2FA code. Please retry." },
          { status: 401 }
        );
      }

      // Issue session
      const session = createAdminSession(user);

      return NextResponse.json({
        success: true,
        session,
        message: `Welcome, ${user.name} (${user.role})!`,
      });
    }

    // 3. Logout
    if (action === "logout") {
      const { token } = body;
      if (token) {
        invalidateAdminSession(token);
      }
      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Auth Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Authentication error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // If list_officers is requested for demo quick-login
      if (searchParams.get("list_officers") === "true") {
        return NextResponse.json({
          success: true,
          officers: ADMIN_USERS.map((u) => ({
            name: u.name,
            email: u.email,
            role: u.role,
            district: u.district,
            state: u.state,
            department: u.department,
          })),
        });
      }

      return NextResponse.json({ success: false, error: "No session token provided" }, { status: 401 });
    }

    const session = validateAdminSession(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session expired or invalid. Please login again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
