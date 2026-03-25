export type UserRole = 'SUPERADMIN' | 'COMPANY_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface Company {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  tax_no?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius_meters?: number;
  created_at: string;
  settings?: CompanySettings;
}

export interface CompanySettings {
  work_days: number[]; // 0-6 (Sun-Sat)
  work_start: string; // "09:00"
  work_end: string; // "18:00"
  late_tolerance_min: number;
  overtime_multiplier: number;
}

export interface Profile {
  id: string; // Maps to auth.users.id
  company_id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  profile_id: string;
  tc_no: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date: string;
  hire_date: string;
  termination_date?: string;
  department_id: string;
  department_name?: string; // Virtual field from join
  position_id: string;
  position_name?: string; // Virtual field from join
  branch_id: string;
  photo_url?: string;
  notes?: string;
  blood_type?: string;
  marital_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  health_info?: string;
  education?: string;
  skills?: string;
  base_salary: number;
  status: 'ACTIVE' | 'PASSIVE';
  custom_fields?: Record<string, any>;
  created_at: string;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  manager_id?: string;
  permissions?: {
    // Personnel
    can_view_personnel?: boolean;
    can_manage_personnel?: boolean;
    
    // Attendance
    can_manage_self_attendance?: boolean;
    can_view_company_attendance?: boolean;
    can_view_dept_attendance?: boolean;

    // Leaves
    can_create_self_leave?: boolean;
    can_view_company_leaves?: boolean;
    can_view_dept_leaves?: boolean;
    can_approve_leaves?: boolean;

    // Assets
    can_view_own_assets?: boolean;
    can_view_company_assets?: boolean;
    
    can_view_reports?: boolean;
    can_manage_settings?: boolean;
  };
}

export interface Position {
  id: string;
  company_id: string;
  name: string;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export interface Attendance {
  id: string;
  employee_id: string;
  company_id: string;
  date: string;
  check_in: string;
  check_out?: string;
  lat_in?: number;
  lng_in?: number;
  lat_out?: number;
  lng_out?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'OVERTIME';
  overtime_hours: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  company_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  day_count: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string;
  created_at: string;
}

export interface Asset {
  id: string;
  employee_id?: string;
  company_id: string;
  name: string;
  type: string;
  serial_no?: string;
  issue_date?: string;
  return_date?: string;
  condition: string;
}

export interface Document {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  file_url: string;
  expiry_date?: string;
  category: string;
  created_at: string;
}

export interface CustomFieldDefinition {
  id: string;
  company_id: string;
  name: string;
  label: string;
  field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT';
  options?: string[];
  is_required: boolean;
  created_at: string;
}

export interface CustomFieldValue {
  id: string;
  employee_id: string;
  field_definition_id: string;
  value: string;
  created_at: string;
}


export interface UserNote {
  id: string;
  profile_id: string;
  title: string;
  content?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportConfig {
  id: string;
  company_id: string;
  name: string;
  query_config: any;
  schedule_cron?: string;
  recipient_emails: string[];
  is_active: boolean;
  created_at: string;
}

export interface AssetLog {
  id: string;
  asset_id: string;
  employee_id?: string;
  action: 'ASSIGNED' | 'RETURNED' | 'REPAIRED' | 'LOST';
  notes?: string;
  created_at: string;
}


export interface AttendanceLog {
  id: string;
  company_id: string;
  profile_id: string;
  check_in_at?: string;
  check_out_at?: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_out_lat?: number;
  check_out_lng?: number;
  status: 'PRESENT' | 'LATE' | 'OVERTIME' | 'EARLY_EXIT';
  created_at: string;
}

export type PuantajStatus = 'M' | 'G' | 'Yİ' | 'Hİ' | 'RT' | 'BT' | 'YG' | 'Öİ' | 'R';

export interface PuantajRecord {
  id: string;
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in?: string; // HH:mm
  check_out?: string; // HH:mm
  status: PuantajStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}
