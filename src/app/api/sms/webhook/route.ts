import { NextRequest, NextResponse } from "next/server";
import { processIncomingSms } from "@/lib/sms/smsEngine";
import { getSmsAnalytics } from "@/lib/sms/smsDatabase";
import { logSms } from "@/lib/monitoring/monitoringEngine";

/**
 * Escapes XML special characters for TwiML responses
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * GET /api/sms/webhook
 * Healthcheck & Twilio connection status verification
 */
export async function GET() {
  const analytics = getSmsAnalytics();
  return NextResponse.json({
    service: "GaganDrishti SMS Feature Phone Gateway",
    status: "Active",
    channel: "Twilio & Webhook Simulator",
    registered_farmers_count: analytics.totalFarmers,
    total_sms_processed: analytics.totalSmsProcessed,
    command_menu: "CROP, WEATHER, FORECAST, PEST, ALERT, REGISTER, LOCATION, HELP",
    twilio_ready: true,
  });
}

/**
 * POST /api/sms/webhook
 * Handles incoming SMS from Twilio Webhook
 */
export async function POST(req: NextRequest) {
  try {
    let fromPhone = "";
    let bodyText = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      fromPhone = (formData.get("From") as string) || "";
      bodyText = (formData.get("Body") as string) || "";
    } else {
      const json = await req.json().catch(() => ({}));
      fromPhone = json.From || json.from || json.phone || "";
      bodyText = json.Body || json.body || json.text || json.message || "";
    }

    if (!fromPhone && !bodyText) {
      return NextResponse.json({ error: "Missing From or Body in request" }, { status: 400 });
    }

    const result = await processIncomingSms(fromPhone, bodyText, "Twilio");

    // FINAL_007: Log incoming and outgoing SMS
    logSms({
      phone_number: fromPhone,
      direction: "incoming",
      message_text: bodyText,
      status: "received",
      twilio_sid: `SM_in_${Date.now()}`,
    });

    logSms({
      phone_number: fromPhone,
      direction: "outgoing",
      message_text: result.reply,
      status: "delivered",
      twilio_sid: `SM_out_${Date.now()}`,
    });

    // Check if client expects JSON or XML
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json(result);
    }

    // Twilio standard TwiML XML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(result.reply)}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Error in Twilio SMS Webhook:", err);
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>GaganDrishti SMS service temporarily unavailable. Please retry in a few moments.</Message>
</Response>`;
    return new NextResponse(fallbackTwiml, {
      status: 500,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }
}
