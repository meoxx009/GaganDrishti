import { ReportType } from "./adminTypes";
import { getDistrictQuickStats, getDistrictRiskZones, getDistrictCropStageDistribution, getDistrictPestAlerts } from "./districtRiskEngine";
import { FARMER_FEEDBACK } from "../feedback/farmerFeedbackDatabase";
import { GOVERNMENT_ALERTS } from "./adminDatabase";

/**
 * Generates CSV content for government administrative reports
 */
export function generateReportCsv(reportType: ReportType, district: string): string {
  const normDistrict = district.trim() || "Raisen";
  const stats = getDistrictQuickStats(normDistrict);
  const now = new Date().toISOString().split("T")[0];

  switch (reportType) {
    case "Weekly Summary Report": {
      const rows = [
        ["GAGANDRISHTI - WEEKLY DISTRICT AGRICULTURAL & METEOROLOGICAL SUMMARY REPORT"],
        ["Generated Date", now],
        ["Target District", normDistrict],
        ["State", "Madhya Pradesh"],
        [],
        ["1. ADMINISTRATIVE METRICS", "VALUE"],
        ["Total Farmers Registered", stats.active_farmers.toString()],
        ["New Farmers This Month", `+${stats.farmers_growth_monthly}`],
        ["Active Alerts Today", stats.active_alerts_count.toString()],
        ["Average Farm Health Rating", `${stats.avg_farm_health} / 10`],
        ["Feedback Entries Received", stats.feedback_entries_count.toString()],
        [],
        ["2. CROP COVERAGE DISTRIBUTION", "PERCENTAGE (%)", "AREA (HECTARES)"],
        ...stats.crop_coverage.map((c) => [c.crop, `${c.percentage}%`, c.area_hectares.toString()]),
        [],
        ["3. RECENT GOVERNMENT ALERTS ISSUED", "SEVERITY", "FARMERS REACHED"],
        ...GOVERNMENT_ALERTS.map((a) => [a.alert_type, a.severity, a.farmers_reached.toString()]),
        [],
        ["4. TOP REPORTED PESTS (LAST 7 DAYS)", "CROP", "INCIDENCE LEVEL"],
        ...getDistrictPestAlerts(normDistrict).map((p) => [p.pest_name, p.crop, p.risk_level]),
      ];
      return rows.map((r) => r.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    }

    case "Farmer Feedback Report": {
      const rows = [
        ["FEEDBACK ID", "DATE", "FARMER NAME", "PHONE", "VILLAGE", "CROP", "STAGE", "HEALTH RATING", "PEST OBSERVED", "COMMENTS"],
        ...FARMER_FEEDBACK.map((f) => [
          f.feedback_id.toString(),
          f.created_at.split("T")[0],
          f.farmer_name,
          f.phone_number,
          f.village,
          f.crop_name,
          f.crop_stage,
          `${f.farm_health_rating}/10`,
          f.pest_disease_observed || "None",
          f.additional_notes || "All good",
        ]),
      ];
      return rows.map((r) => r.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    }

    case "Alert Response Report": {
      const rows = [
        ["ALERT ID", "TIMESTAMP", "SENDER", "ALERT TYPE", "AFFECTED DISTRICTS", "SEVERITY", "CHANNELS", "FARMERS REACHED", "STATUS", "ACKNOWLEDGEMENT RATE"],
        ...GOVERNMENT_ALERTS.map((a) => [
          a.alert_id,
          a.created_at,
          a.sender_name,
          a.alert_type,
          a.affected_districts.join("; "),
          a.severity,
          a.channels.join("; "),
          a.farmers_reached.toString(),
          a.delivery_status,
          `${a.acknowledgement_rate_percent || 85}%`,
        ]),
      ];
      return rows.map((r) => r.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    }

    case "District Risk Assessment": {
      const riskZones = getDistrictRiskZones(normDistrict);
      const rows = [
        ["PINCODE", "VILLAGE / TEHSIL", "DISTRICT", "ELEVATION (M)", "SOIL TYPE", "RISK LEVEL", "RISK REASON", "FARMER POPULATION", "CURRENT TEMP", "RAIN PROBABILITY", "ACTION REQUIRED"],
        ...riskZones.map((z) => [
          z.pincode,
          z.village_or_tehsil,
          z.district,
          z.elevation_m.toString(),
          z.soil_type,
          z.risk_level,
          z.risk_reason,
          z.farmer_count.toString(),
          `${z.current_temp}°C`,
          `${z.rain_probability}%`,
          z.recommended_action,
        ]),
      ];
      return rows.map((r) => r.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    }

    default:
      return "ERROR,Unknown Report Type";
  }
}
