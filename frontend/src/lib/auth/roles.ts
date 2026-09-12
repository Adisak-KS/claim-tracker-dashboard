/**
 * ตอนนี้ทุก role เห็นเหมือนกันหมด ยกเว้น admin ที่เข้าหน้าตั้งค่าได้
 * อนาคตถ้าต้องแยกสิทธิ์ ให้แก้ที่ตาราง ROLE_PERMISSIONS ที่เดียว
 * โค้ดที่อื่นเรียกผ่าน can() เสมอ ห้ามเช็ค role ตรง ๆ
 */
export const ROLES = ["executive", "manager", "pm", "trainer", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  executive: "ผู้บริหาร",
  manager: "ผู้จัดการ",
  pm: "ผู้จัดการโครงการ",
  trainer: "ทีมฝึกอบรม",
  admin: "ผู้ดูแลระบบ",
};

export const PERMISSIONS = [
  "dashboard:view",
  "hospital:view",
  "submission:view",
  "issue:view",
  "report:view",
  "report:export",
  "admin:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const VIEWER_PERMISSIONS: Permission[] = [
  "dashboard:view",
  "hospital:view",
  "submission:view",
  "issue:view",
  "report:view",
  "report:export",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  executive: VIEWER_PERMISSIONS,
  manager: VIEWER_PERMISSIONS,
  pm: VIEWER_PERMISSIONS,
  trainer: VIEWER_PERMISSIONS,
  admin: [...VIEWER_PERMISSIONS, "admin:manage"],
};

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  /** หน่วยงานที่สังกัด ใช้แสดงผลเท่านั้น ยังไม่จำกัดสิทธิ์ */
  department?: string;
}

export function can(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function canAccessRoute(
  user: SessionUser | null,
  requiredRoles?: Role[],
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return Boolean(user);
  if (!user) return false;
  return requiredRoles.includes(user.role);
}
