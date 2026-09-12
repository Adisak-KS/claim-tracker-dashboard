/**
 * ประเภทหน่วยบริการใช้ตามทะเบียนกระทรวงสาธารณสุข (hcode.moph.go.th) ทั้งหมด 17 ประเภท
 * ห้ามตั้งประเภทเองเพราะจะ map กับข้อมูลที่ระบบต้นทางส่งมาไม่ตรง
 */
export const PROVIDER_TYPES = [
  "private_clinic",
  "health_promoting_hospital",
  "lao_health_center",
  "district_health_office",
  "community_hospital",
  "health_center",
  "private_hospital",
  "urban_health_center",
  "academic_center",
  "non_moph_hospital",
  "general_hospital",
  "hospital_branch",
  "community_health_facility",
  "provincial_health_office",
  "non_ops_hospital",
  "regional_hospital",
  "primary_care_unit",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export interface ProviderTypeInfo {
  id: ProviderType;
  /** ชื่อตามทะเบียนกระทรวง ห้ามแก้ ใช้จับคู่กับข้อมูลที่ส่งเข้ามา */
  label: string;
  /** ชื่อย่อสำหรับพื้นที่แคบ เช่น ในตารางหรือการ์ด */
  shortLabel: string;
  /** จัดกลุ่มขนาดเพื่อเทียบหน่วยที่โหลดงานใกล้เคียงกัน */
  tier: "large" | "medium" | "small";
  /** สัดส่วนจริงในทะเบียน (ร้อยละ) ใช้ถ่วงน้ำหนักตอนสร้างข้อมูลจำลอง */
  sharePct: number;
}

export const PROVIDER_TYPE_INFO: Record<ProviderType, ProviderTypeInfo> = {
  private_clinic: {
    id: "private_clinic",
    label: "คลินิกเอกชน",
    shortLabel: "คลินิกเอกชน",
    tier: "small",
    sharePct: 66.955,
  },
  health_promoting_hospital: {
    id: "health_promoting_hospital",
    label: "โรงพยาบาลส่งเสริมสุขภาพตำบล",
    shortLabel: "รพ.สต.",
    tier: "small",
    sharePct: 12.509,
  },
  lao_health_center: {
    id: "lao_health_center",
    label: "ศูนย์บริการสาธารณสุข อปท.",
    shortLabel: "ศูนย์ฯ อปท.",
    tier: "small",
    sharePct: 11.325,
  },
  district_health_office: {
    id: "district_health_office",
    label: "สำนักงานสาธารณสุขอำเภอ",
    shortLabel: "สสอ.",
    tier: "small",
    sharePct: 2.043,
  },
  community_hospital: {
    id: "community_hospital",
    label: "โรงพยาบาลชุมชน",
    shortLabel: "รพ.ชุมชน",
    tier: "medium",
    sharePct: 1.761,
  },
  health_center: {
    id: "health_center",
    label: "ศูนย์บริการสาธารณสุข",
    shortLabel: "ศูนย์บริการฯ",
    tier: "small",
    sharePct: 1.2,
  },
  private_hospital: {
    id: "private_hospital",
    label: "โรงพยาบาลเอกชน",
    shortLabel: "รพ.เอกชน",
    tier: "medium",
    sharePct: 1.161,
  },
  urban_health_center: {
    id: "urban_health_center",
    label: "ศูนย์สุขภาพชุมชน ของ รพ. / เมือง (ศสม.)",
    shortLabel: "ศสม.",
    tier: "small",
    sharePct: 0.884,
  },
  academic_center: {
    id: "academic_center",
    label: "ศูนย์วิชาการ",
    shortLabel: "ศูนย์วิชาการ",
    tier: "small",
    sharePct: 0.754,
  },
  non_moph_hospital: {
    id: "non_moph_hospital",
    label: "โรงพยาบาล นอก สธ.",
    shortLabel: "รพ.นอก สธ.",
    tier: "medium",
    sharePct: 0.319,
  },
  general_hospital: {
    id: "general_hospital",
    label: "โรงพยาบาลทั่วไป",
    shortLabel: "รพ.ทั่วไป",
    tier: "large",
    sharePct: 0.251,
  },
  hospital_branch: {
    id: "hospital_branch",
    label: "โรงพยาบาล/ศูนย์บริการสาธารณสุข สาขา",
    shortLabel: "สาขา",
    tier: "small",
    sharePct: 0.235,
  },
  community_health_facility: {
    id: "community_health_facility",
    label: "สถานบริการสาธารณสุขชุมชน",
    shortLabel: "สถานบริการฯ",
    tier: "small",
    sharePct: 0.179,
  },
  provincial_health_office: {
    id: "provincial_health_office",
    label: "สำนักงานสาธารณสุขจังหวัด",
    shortLabel: "สสจ.",
    tier: "small",
    sharePct: 0.177,
  },
  non_ops_hospital: {
    id: "non_ops_hospital",
    label: "โรงพยาบาล นอก สป.สธ.",
    shortLabel: "รพ.นอก สป.สธ.",
    tier: "medium",
    sharePct: 0.149,
  },
  regional_hospital: {
    id: "regional_hospital",
    label: "โรงพยาบาลศูนย์",
    shortLabel: "รพ.ศูนย์",
    tier: "large",
    sharePct: 0.093,
  },
  primary_care_unit: {
    id: "primary_care_unit",
    label: "หน่วยบริการปฐมภูมิ (PCU)",
    shortLabel: "PCU",
    tier: "small",
    sharePct: 0.005,
  },
};

export const PROVIDER_TIER_LABEL = {
  large: "หน่วยบริการขนาดใหญ่",
  medium: "หน่วยบริการขนาดกลาง",
  small: "หน่วยบริการขนาดเล็ก",
} as const;

/** ระบบต้นทางที่ยิงข้อมูลเข้ามา เพิ่มได้ในอนาคต */
export type SourceSystem = "HOSxP" | "EHP" | "NHIP" | "OTHER";

/**
 * กระทรวงออกรหัสให้หน่วยบริการ 3 แบบ และหน่วยที่ขึ้นทะเบียนหลัง 1 เม.ย. 2568
 * ได้เฉพาะรหัส 9 หลักใหม่ ไม่มีรหัสเก่าทั้งสองแบบ (3,155 แห่งในทะเบียนเป็นแบบนี้
 * ในนั้นเป็นคลินิกเอกชน 3,049 แห่ง) ระบบจึงต้องเก็บครบทั้ง 3 ช่อง
 * ถ้าเก็บช่องเดียว หน่วยเดียวกันที่ส่งคนละรหัสจะถูกนับเป็นคนละแห่ง
 */
export interface ProviderCodes {
  /** ตัวอักษร 2 ตัว + เลข 7 หลัก เช่น CA0032045 มีครบทุกแห่ง ใช้เป็นกุญแจหลัก */
  newCode: string;
  /** รหัส 9 หลักเดิม เป็นตัวเลขล้วน หน่วยที่ขึ้นทะเบียนใหม่ไม่มี */
  legacyCode?: string;
  /** รหัส 5 หลักเดิม หน่วยที่ขึ้นทะเบียนใหม่ไม่มี */
  shortCode?: string;
}

/**
 * ข้อมูลหน่วยบริการมาจากทะเบียน ไม่ได้มาจากที่ผู้ส่งกรอกเอง
 * ถ้าผู้ส่งกรอกเอง แต่ละที่จะเขียนชื่อจังหวัดไม่เหมือนกันแล้วกรองไม่ตรง
 */
export interface Provider extends ProviderCodes {
  name: string;
  type: ProviderType;
  province: string;
  /** เขตสุขภาพ 1 ถึง 13 */
  healthZone: number;
  sourceSystem: SourceSystem;
  /** true = ไม่พบรหัสนี้ในทะเบียน ใช้ชื่อที่ผู้ส่งแนบมาแทน */
  unregistered?: boolean;
}

/** ใช้ในลิงก์และตัวกรอง รหัสใหม่มีครบทุกแห่งจึงอ้างอิงได้เสมอ */
export function providerKey(p: ProviderCodes): string {
  return p.newCode;
}

/**
 * ระบบต้นทางรุ่นเก่าส่งรหัส 5 หลักมา รุ่นใหม่ส่งรหัส 9 หลักใหม่
 * จึงต้องหาให้เจอไม่ว่าจะส่งแบบไหนมา
 */
export function matchesCode(p: ProviderCodes, code: string): boolean {
  const q = code.trim();
  return q === p.newCode || q === p.legacyCode || q === p.shortCode;
}
