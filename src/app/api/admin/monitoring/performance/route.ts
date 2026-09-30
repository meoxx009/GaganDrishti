import { NextRequest, NextResponse } from "next/server";
import { logPerformance, logUserSession } from "@/lib/monitoring/monitoringEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      page_name,
      load_time_ms,
      network_time_ms,
      rendering_time_ms,
      dns_time_ms,
      tcp_time_ms,
      ttfb_ms,
      device_type,
      network_speed,
      session_event,
    } = body;

    // Log performance metrics
    if (page_name && typeof load_time_ms === "number") {
      logPerformance({
        page_name,
        load_time_ms: Math.round(load_time_ms),
        network_time_ms: Math.round(network_time_ms || 0),
        rendering_time_ms: Math.round(rendering_time_ms || 0),
        dns_time_ms: dns_time_ms ? Math.round(dns_time_ms) : undefined,
        tcp_time_ms: tcp_time_ms ? Math.round(tcp_time_ms) : undefined,
        ttfb_ms: ttfb_ms ? Math.round(ttfb_ms) : undefined,
        device_type: device_type || "mobile",
        network_speed: network_speed || "4G",
      });
    }

    // Optional user session action tracking (Step 1 & Step 4)
    if (session_event) {
      logUserSession({
        start_time: session_event.start_time || new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: session_event.duration_seconds || 120,
        pages_visited: session_event.pages_visited || [page_name || "/"],
        actions_taken: session_event.actions_taken || ["page_view"],
        device_type: device_type || "mobile",
        browser: session_event.browser || "Browser",
        country: "India",
        pincode: session_event.pincode,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking for client
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
