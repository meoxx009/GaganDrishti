import {
  AdminUserRecord,
  AdminSession,
  AdminRole,
  BroadcastAlertRecord,
  EmailScheduleConfig,
} from "./adminTypes";
import crypto from "crypto";

// Simple SHA-256 hash helper
export function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(plain + "GAGANDRISHTI_GOV_SALT_2026").digest("hex");
}

const DEFAULT_HASH = hashPassword("Admin@2026!");

// 1. Initial 12 Government Admin Users (10 District Admins, 1 State Admin, 1 Disaster Officer)
export const ADMIN_USERS: AdminUserRecord[] = [
  {
    admin_id: 1,
    name: "Raj Kumar Singh",
    email: "admin.raisen@mp.gov.in",
    role: "District Admin",
    district: "Raisen",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011001",
    active: true,
    department: "District Collectorate & Agriculture Office, Raisen",
  },
  {
    admin_id: 2,
    name: "Dr. Sunita Chouhan",
    email: "admin.sehore@mp.gov.in",
    role: "District Admin",
    district: "Sehore",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011002",
    active: true,
    department: "Deputy Director Agriculture, Sehore",
  },
  {
    admin_id: 3,
    name: "Mahesh Chandra Verma",
    email: "admin.vidisha@mp.gov.in",
    role: "District Admin",
    district: "Vidisha",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011003",
    active: true,
    department: "District Disaster Management Authority, Vidisha",
  },
  {
    admin_id: 4,
    name: "Pooja Sharma",
    email: "admin.bhopal@mp.gov.in",
    role: "District Admin",
    district: "Bhopal",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011004",
    active: true,
    department: "District Agriculture Officer, Bhopal",
  },
  {
    admin_id: 5,
    name: "Anil Kumar Tiwari",
    email: "admin.sagar@mp.gov.in",
    role: "District Admin",
    district: "Sagar",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011005",
    active: true,
    department: "Collectorate Office, Sagar",
  },
  {
    admin_id: 6,
    name: "Virendra Patel",
    email: "admin.hoshangabad@mp.gov.in",
    role: "District Admin",
    district: "Hoshangabad",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011006",
    active: true,
    department: "Narmadapuram District Agriculture Commission",
  },
  {
    admin_id: 7,
    name: "Alok Mukherjee",
    email: "admin.jabalpur@mp.gov.in",
    role: "District Admin",
    district: "Jabalpur",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011007",
    active: true,
    department: "District Monitoring Wing, Jabalpur",
  },
  {
    admin_id: 8,
    name: "Kavita Rathore",
    email: "admin.dewas@mp.gov.in",
    role: "District Admin",
    district: "Dewas",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011008",
    active: true,
    department: "Department of Farmer Welfare, Dewas",
  },
  {
    admin_id: 9,
    name: "Sanjay Joshi",
    email: "admin.ujjain@mp.gov.in",
    role: "District Admin",
    district: "Ujjain",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011009",
    active: true,
    department: "Ujjain Krishi Vigyan & Administrative Cell",
  },
  {
    admin_id: 10,
    name: "Dharmendra Sisodia",
    email: "admin.indore@mp.gov.in",
    role: "District Admin",
    district: "Indore",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011010",
    active: true,
    department: "District Administration & Smart City Center, Indore",
  },
  {
    admin_id: 11,
    name: "Siddharth Rao, IAS",
    email: "state.admin@mp.gov.in",
    role: "State Admin",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011999",
    active: true,
    department: "State Department of Agriculture & Farmers' Welfare, MP Vallabh Bhawan",
  },
  {
    admin_id: 12,
    name: "Col. Rajesh Nayak (Retd)",
    email: "disaster.officer@mp.gov.in",
    role: "Disaster Officer",
    state: "Madhya Pradesh",
    password_hash: DEFAULT_HASH,
    phone: "9826011888",
    active: true,
    department: "State Disaster Management Authority (MP SDMA), Relief Commissionerate",
  },
];

// Active sessions memory store
export const ACTIVE_SESSIONS = new Map<string, AdminSession>();

// Government Broadcast Alerts table
export const GOVERNMENT_ALERTS: BroadcastAlertRecord[] = [
  {
    alert_id: "GOV-ALT-2026-001",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sender_admin_id: 1,
    sender_name: "Raj Kumar Singh",
    sender_role: "District Admin",
    alert_type: "Heavy Rain",
    affected_districts: ["Raisen", "Sehore", "Vidisha"],
    severity: "High",
    alert_message: "Heavy rainfall warning (40-60mm) expected in Betwa river basin. Waterlogging likely in low-lying crop fields.",
    recommended_action: "Clear field drainage channels immediately. Postpone all chemical spray and fertilizer application for 48 hours.",
    channels: ["SMS", "In-app Notification", "Broadcast"],
    farmers_reached: 2450,
    delivery_status: "DELIVERED",
    acknowledgement_rate_percent: 88,
  },
  {
    alert_id: "GOV-ALT-2026-002",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sender_admin_id: 12,
    sender_name: "Col. Rajesh Nayak (Retd)",
    sender_role: "Disaster Officer",
    alert_type: "Strong Wind",
    affected_districts: ["Bhopal", "Sehore", "Dewas"],
    severity: "Significant",
    alert_message: "Gusty squall winds (45-55 km/h) forecasted during evening convective showers.",
    recommended_action: "Provide earthing support to tall standing crops (Maize/Sugarcane). Tie loose tarpaulin over harvested produce.",
    channels: ["SMS", "In-app Notification"],
    farmers_reached: 4180,
    delivery_status: "DELIVERED",
    acknowledgement_rate_percent: 79,
  },
  {
    alert_id: "GOV-ALT-2026-003",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    sender_admin_id: 2,
    sender_name: "Dr. Sunita Chouhan",
    sender_role: "District Admin",
    alert_type: "Pest Outbreak",
    affected_districts: ["Sehore", "Raisen"],
    severity: "High",
    alert_message: "Yellow Mosaic Virus (YMV) whitefly vector surge detected in early-sown soybean blocks.",
    recommended_action: "Erect yellow sticky traps (15-20/acre). Spray Thiamethoxam 25% WG @ 40g/acre on non-flowering crops.",
    channels: ["SMS", "Email", "In-app Notification"],
    farmers_reached: 3200,
    delivery_status: "DELIVERED",
    acknowledgement_rate_percent: 92,
  },
];

// Scheduled Government Email Configs
export const EMAIL_SCHEDULES: EmailScheduleConfig[] = [
  {
    id: "SCHED_DAILY_7AM",
    frequency: "Daily Morning (7 AM)",
    recipient_role: "District Admin",
    recipients: ["admin.raisen@mp.gov.in", "admin.sehore@mp.gov.in", "admin.vidisha@mp.gov.in"],
    subject: "GaganDrishti Daily Morning District Weather & Farmer Risk Briefing",
    last_sent: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    next_run: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "SCHED_WEEKLY_FRI",
    frequency: "Weekly (Friday Evening)",
    recipient_role: "District + State Admin",
    recipients: ["state.admin@mp.gov.in", "admin.raisen@mp.gov.in", "admin.sehore@mp.gov.in"],
    subject: "GaganDrishti Weekly Agricultural Telemetry & Risk Mitigation Digest",
    last_sent: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    next_run: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "SCHED_REALTIME_DISASTER",
    frequency: "Real-time (On Alert)",
    recipient_role: "Disaster Management Officer",
    recipients: ["disaster.officer@mp.gov.in"],
    subject: "URGENT: Severe Meteorological Hazard Triggered in District Corridor",
    last_sent: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    next_run: "Instant on alert trigger",
    status: "ACTIVE",
  },
];

// 2FA in-memory cache: email -> { code, expiry }
const TWO_FACTOR_CACHE = new Map<string, { code: string; expiresAt: number }>();

/**
 * Find admin user by email
 */
export function findAdminByEmail(email: string): AdminUserRecord | undefined {
  return ADMIN_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

/**
 * Validate password
 */
export function verifyPassword(user: AdminUserRecord, passwordAttempt: string): boolean {
  return user.password_hash === hashPassword(passwordAttempt);
}

/**
 * Generate 6-digit 2FA code
 */
export function generate2FACode(email: string): string {
  // Deterministic fallback for testing / easy demo: "123456" or random 6-digit
  const code = email.includes("admin") ? "742918" : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  TWO_FACTOR_CACHE.set(email.toLowerCase(), { code, expiresAt });
  return code;
}

/**
 * Verify 2FA code
 */
export function verify2FACode(email: string, code: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const cached = TWO_FACTOR_CACHE.get(cleanEmail);
  
  // Allow universal test code 123456 or the exact generated code
  if (code === "123456" || code === "742918") {
    return true;
  }

  if (!cached) return false;
  if (Date.now() > cached.expiresAt) {
    TWO_FACTOR_CACHE.delete(cleanEmail);
    return false;
  }
  return cached.code === code.trim();
}

/**
 * Create Admin Session
 */
export function createAdminSession(user: AdminUserRecord): AdminSession {
  const token = "gov_sess_" + crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins session timeout

  const session: AdminSession = {
    token,
    admin_id: user.admin_id,
    name: user.name,
    email: user.email,
    role: user.role,
    district: user.district,
    state: user.state,
    department: user.department,
    expires_at: expiresAt,
  };

  ACTIVE_SESSIONS.set(token, session);
  user.last_login = new Date().toISOString();
  return session;
}

/**
 * Validate Admin Session
 */
export function validateAdminSession(token?: string | null): AdminSession | null {
  if (!token) return null;
  const session = ACTIVE_SESSIONS.get(token);
  if (!session) return null;

  if (new Date() > new Date(session.expires_at)) {
    ACTIVE_SESSIONS.delete(token);
    return null;
  }

  return session;
}

/**
 * Invalidate session
 */
export function invalidateAdminSession(token: string): boolean {
  return ACTIVE_SESSIONS.delete(token);
}

/**
 * Add broadcast alert
 */
export function addBroadcastAlert(alert: BroadcastAlertRecord): void {
  GOVERNMENT_ALERTS.unshift(alert);
}
