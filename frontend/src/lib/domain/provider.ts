/**
 * หน่วยบริการไม่ได้มีแต่โรงพยาบาล คลินิกและร้านยาก็ส่งเคลมได้
 * ที่มา: หน่วยบริการที่ขึ้นทะเบียนกับ สปสช. ตามประกาศสิทธิบัตรทอง
 */
export const PROVIDER_TYPES = [
  "regional_hospital",
  "general_hospital",
  "community_hospital",
  "health_promoting_hospital",
  "specialized_hospital",
  "other_affiliation_hospital",
  "private_hospital",
  "clinic",
  "pharmacy",
  "other",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export interface ProviderTypeInfo {
  id: ProviderType;
  label: string;
  shortLabel: string;
  /** จัดกลุ่มใหญ่เพื่อใช้เปรียบเทียบขนาดที่ใกล้เคียงกัน */
  tier: "large" | "medium" | "small";
}

export const PROVIDER_TYPE_INFO: Record<ProviderType, ProviderTypeInfo> = {
  regional_hospital: {
    id: "regional_hospital",
    label: "โรงพยาบาลศูนย์",
    shortLabel: "รพ.ศูนย์",
    tier: "large",
  },
  general_hospital: {
    id: "general_hospital",
    label: "โรงพยาบาลทั่วไป",
    shortLabel: "รพ.ทั่วไป",
    tier: "large",
  },
  community_hospital: {
    id: "community_hospital",
    label: "โรงพยาบาลชุมชน",
    shortLabel: "รพ.ชุมชน",
    tier: "medium",
  },
  health_promoting_hospital: {
    id: "health_promoting_hospital",
    label: "โรงพยาบาลส่งเสริมสุขภาพตำบล",
    shortLabel: "รพ.สต.",
    tier: "small",
  },
  specialized_hospital: {
    id: "specialized_hospital",
    label: "โรงพยาบาลเฉพาะทาง",
    shortLabel: "รพ.เฉพาะทาง",
    tier: "medium",
  },
  other_affiliation_hospital: {
    id: "other_affiliation_hospital",
    label: "โรงพยาบาลสังกัดอื่น",
    shortLabel: "รพ.สังกัดอื่น",
    tier: "medium",
  },
  private_hospital: {
    id: "private_hospital",
    label: "โรงพยาบาลเอกชน",
    shortLabel: "รพ.เอกชน",
    tier: "medium",
  },
  clinic: {
    id: "clinic",
    label: "คลินิก",
    shortLabel: "คลินิก",
    tier: "small",
  },
  pharmacy: {
    id: "pharmacy",
    label: "ร้านยา",
    shortLabel: "ร้านยา",
    tier: "small",
  },
  other: {
    id: "other",
    label: "หน่วยบริการอื่น",
    shortLabel: "อื่น ๆ",
    tier: "small",
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
 * ข้อมูลหน่วยบริการมาจากทะเบียน ไม่ได้มาจากที่ผู้ส่งกรอกเอง
 * ถ้าผู้ส่งกรอกเอง แต่ละที่จะเขียนชื่อจังหวัดไม่เหมือนกันแล้วกรองไม่ตรง
 */
export interface Provider {
  /** รหัสหน่วยบริการ 5 หลักของกระทรวงสาธารณสุข */
  code: string;
  name: string;
  type: ProviderType;
  province: string;
  /** เขตสุขภาพ 1 ถึง 13 */
  healthZone: number;
  sourceSystem: SourceSystem;
  /** true = ไม่พบรหัสนี้ในทะเบียน ใช้ชื่อที่ผู้ส่งแนบมาแทน */
  unregistered?: boolean;
}
