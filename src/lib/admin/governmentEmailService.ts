import { EMAIL_SCHEDULES } from "./adminDatabase";
import { getDistrictQuickStats, getDistrictRiskZones, getDistrictPestAlerts } from "./districtRiskEngine";
import { GOVERNMENT_ALERTS } from "./adminDatabase";

export interface EmailDispatchResult {
  schedule_id: string;
  subject: string;
  recipients: string[];
  sent_at: string;
  html_preview: string;
  text_preview: string;
  status: "SUCCESS" | "QUEUED";
}

/**
 * Generates and simulates government email briefings
 */
export function generateGovernmentEmailDigest(
  scheduleId: string,
  district: string = "Raisen"
): EmailDispatchResult {
  const sched = EMAIL_SCHEDULES.find((s) => s.id === scheduleId) || EMAIL_SCHEDULES[0];
  const stats = getDistrictQuickStats(district);
  const riskZones = getDistrictRiskZones(district);
  const highRisk = riskZones.filter((z) => z.risk_level === "HIGH" || z.risk_level === "SIGNIFICANT");
  const pests = getDistrictPestAlerts(district);
  const now = new Date().toISOString();

  let subject = "";
  let bodyHtml = "";
  let bodyText = "";

  if (sched.id === "SCHED_DAILY_7AM") {
    subject = `[Daily 7 AM Briefing] ${district} District: Weather Alerts & Agricultural Risk Status`;
    bodyText = `
GOVERNMENT OF MADHYA PRADESH - DISTRICT DISASTER & AGRICULTURE WING
DAILY MORNING BRIEFING (${district} District) - ${new Date().toLocaleDateString("en-IN")}

1. WEATHER & ALERT OVERVIEW
- Active Weather Alerts: ${stats.active_alerts_count} (High: ${stats.alert_severity_breakdown.high}, Med: ${stats.alert_severity_breakdown.medium})
- Registered Farmers in District: ${stats.active_farmers}
- Average Field Health Score: ${stats.avg_farm_health} / 10

2. HIGH RISK ZONES IDENTIFIED (${highRisk.length} Locations)
${highRisk.map((z) => `• ${z.village_or_tehsil} (${z.pincode}): ${z.risk_reason} [Farmers: ${z.farmer_count}]`).join("\n")}

3. TOP CRITICAL PEST/DISEASE THREATS
${pests.slice(0, 3).map((p) => `• ${p.pest_name} on ${p.crop} (${p.risk_level} Urgency)`).join("\n")}

4. RECOMMENDED ADMINISTRATIVE ACTIONS
- Keep field ditchers on alert for heavy soil drainage in Betwa basin.
- Disseminate advisory against chemical spraying during afternoon squalls.

GaganDrishti Autonomous Meteorological Intelligence System.
    `.trim();

    bodyHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #1e3a8a; color: white; padding: 16px; text-align: center;">
    <h2 style="margin: 0; font-size: 18px;">Government of Madhya Pradesh</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">District Agriculture & Disaster Briefing (${district})</p>
  </div>
  <div style="padding: 20px; background-color: #ffffff; color: #1e293b;">
    <h3 style="color: #0f172a; margin-top: 0;">Daily Situation Report</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Active Farmers Monitored:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${stats.active_farmers.toLocaleString("en-IN")}</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Active Weather Warnings:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${stats.active_alerts_count} Today</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Average Farm Health:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${stats.avg_farm_health} / 10</td></tr>
    </table>
    <h4 style="color: #b91c1c; margin-bottom: 8px;">Critical Risk Zones (${highRisk.length} Detected)</h4>
    <ul style="font-size: 12px; color: #334155; padding-left: 20px; line-height: 1.5;">
      ${highRisk.map((z) => `<li><strong>${z.village_or_tehsil}</strong> (${z.pincode}): ${z.risk_reason} (<em>${z.farmer_count} farmers</em>)</li>`).join("")}
    </ul>
    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px; margin-top: 16px; font-size: 12px;">
      <strong>Recommended Action:</strong> Instruct extension workers to monitor field drainage and broadcast SMS spray warnings to vulnerable clusters.
    </div>
  </div>
</div>
    `.trim();
  } else if (sched.id === "SCHED_WEEKLY_FRI") {
    subject = `[Weekly Review] ${district} & State Agriculture Telemetry & Response Digest`;
    bodyText = `
GAGANDRISHTI STATEWIDE WEEKLY TELEMETRY DIGEST
District: ${district} | State: Madhya Pradesh

- Total Farmers Enrolled: ${stats.active_farmers} (+${stats.farmers_growth_monthly} new this month)
- Broadcast Alerts Delivered: ${GOVERNMENT_ALERTS.length} alerts reaching > 9,800 farmers
- Average Alert Compliance: 88%
- Dominant Crop Stage: Flowering (40% of standing crop)
- Farm Health Rating: ${stats.avg_farm_health} / 10

Detailed analytics available on Government Command Center: /admin/district-dashboard
    `.trim();

    bodyHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
  <h2 style="color: #0f172a;">Weekly Agricultural Operations Review</h2>
  <p style="font-size: 13px; color: #475569;">Comprehensive overview of weather resilience, farmer feedback, and alert effectiveness across ${district}.</p>
  <div style="display: flex; gap: 10px; margin: 15px 0;">
    <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; text-align: center;">
      <div style="font-size: 20px; font-weight: bold; color: #16a34a;">${stats.avg_farm_health}</div>
      <div style="font-size: 11px; color: #15803d;">Avg Health</div>
    </div>
    <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 6px; text-align: center;">
      <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${stats.active_farmers}</div>
      <div style="font-size: 11px; color: #1d4ed8;">Active Farmers</div>
    </div>
  </div>
</div>
    `.trim();
  } else {
    subject = `[URGENT] Real-time Meteorological Hazard Triggered: ${district} Corridor`;
    bodyText = `
IMMEDIATE ATTENTION: DISASTER MANAGEMENT CELL
Extreme or severe weather conditions triggered in ${district}.
Hazard: Heavy Rainfall & River Surge Warning
Affected Population: ~${stats.active_farmers} farmers in low-lying taluks.
Broadcast emergency advisory immediately via Government Admin Command Center.
    `.trim();

    bodyHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; background: #fef2f2;">
  <h2 style="color: #b91c1c; margin-top: 0;">⚠️ URGENT DISASTER ADVISORY</h2>
  <p style="font-size: 13px; color: #7f1d1d;">A severe convective rainstorm has triggered automatic high-priority threshold flags in ${district}.</p>
  <p style="font-size: 12px; font-weight: bold;">Immediate Actions Required: Activate village alert broadcast and coordinate with taluk revenue inspectors.</p>
</div>
    `.trim();
  }

  return {
    schedule_id: sched.id,
    subject,
    recipients: sched.recipients,
    sent_at: now,
    html_preview: bodyHtml,
    text_preview: bodyText,
    status: "SUCCESS",
  };
}
