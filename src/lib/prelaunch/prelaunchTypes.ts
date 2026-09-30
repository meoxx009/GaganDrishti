/**
 * FINAL_008: Pre-Launch Checklist & Production Deployment Types
 * Maps all 9 sections, launch timeline, and signoff criteria.
 */

export interface ChecklistItem {
  id: string;
  name: string;
  category:
    | "security"
    | "functionality"
    | "performance"
    | "compatibility"
    | "offline"
    | "data"
    | "documentation"
    | "monitoring"
    | "operations";
  verification_procedure: string;
  status: "PASSED" | "VERIFIED" | "IN_PROGRESS" | "ACTION_REQUIRED";
  tested_at: string;
  notes: string;
}

export interface ChecklistSection {
  section_id: string;
  title: string;
  icon_name: string;
  items: ChecklistItem[];
}

export interface LaunchTimelinePhase {
  phase_id: "t_minus_2_hours" | "t_0_launch" | "t_plus_1_hour" | "t_plus_24_hours";
  title: string;
  scheduled_time: string;
  tasks: Array<{ task: string; completed: boolean }>;
}

export interface FinalSignoffItem {
  key: string;
  label: string;
  description: string;
  signed_off: boolean;
  signed_by?: string;
  signed_at?: string;
}

export interface PreLaunchDashboardData {
  total_checks: number;
  passed_checks: number;
  readiness_percentage: number;
  overall_readiness: "READY_FOR_PRODUCTION" | "CONDITIONAL_APPROVAL" | "BLOCKED";
  sections: ChecklistSection[];
  timeline: LaunchTimelinePhase[];
  signoff_items: FinalSignoffItem[];
  lead_signoff: {
    is_signed_off: boolean;
    signee_name?: string;
    signee_title?: string;
    timestamp?: string;
  };
}
