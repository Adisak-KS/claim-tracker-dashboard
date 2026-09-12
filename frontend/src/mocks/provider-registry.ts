import type { ProviderType } from "@/lib/domain/provider";

/**
 * ทะเบียนหน่วยบริการ: map รหัส 5 หลัก เป็นชื่อ จังหวัด เขต ประเภท
 *
 * ของจริงโหลดจากทะเบียนกระทรวงสาธารณสุข (hcode.moph.go.th) ไม่ใช่ให้ Admin กรอกเอง
 * ผู้ส่งเคลมส่งมาแค่รหัส เพราะถ้าให้ส่งชื่อจังหวัดมาเอง
 * แต่ละที่จะเขียนไม่เหมือนกัน (กรุงเทพ กับ กรุงเทพมหานคร) แล้วกรองไม่ตรงกัน
 */

export interface ProvinceInfo {
  name: string;
  healthZone: number;
}

/**
 * จังหวัดผูกกับเขตสุขภาพตายตัว ไม่ใช่สุ่ม
 * ที่มา: การแบ่งเขตสุขภาพ 13 เขต ของกระทรวงสาธารณสุข
 */
export const PROVINCES: ProvinceInfo[] = [
  { name: "เชียงใหม่", healthZone: 1 },
  { name: "เชียงราย", healthZone: 1 },
  { name: "ลำปาง", healthZone: 1 },
  { name: "น่าน", healthZone: 1 },
  { name: "พิษณุโลก", healthZone: 2 },
  { name: "ตาก", healthZone: 2 },
  { name: "เพชรบูรณ์", healthZone: 2 },
  { name: "นครสวรรค์", healthZone: 3 },
  { name: "ชัยนาท", healthZone: 3 },
  { name: "อุทัยธานี", healthZone: 3 },
  { name: "พระนครศรีอยุธยา", healthZone: 4 },
  { name: "สระบุรี", healthZone: 4 },
  { name: "ปทุมธานี", healthZone: 4 },
  { name: "นนทบุรี", healthZone: 4 },
  { name: "ราชบุรี", healthZone: 5 },
  { name: "กาญจนบุรี", healthZone: 5 },
  { name: "เพชรบุรี", healthZone: 5 },
  { name: "ชลบุรี", healthZone: 6 },
  { name: "ระยอง", healthZone: 6 },
  { name: "จันทบุรี", healthZone: 6 },
  { name: "ฉะเชิงเทรา", healthZone: 6 },
  { name: "ขอนแก่น", healthZone: 7 },
  { name: "มหาสารคาม", healthZone: 7 },
  { name: "ร้อยเอ็ด", healthZone: 7 },
  { name: "กาฬสินธุ์", healthZone: 7 },
  { name: "อุดรธานี", healthZone: 8 },
  { name: "สกลนคร", healthZone: 8 },
  { name: "หนองคาย", healthZone: 8 },
  { name: "เลย", healthZone: 8 },
  { name: "นครราชสีมา", healthZone: 9 },
  { name: "บุรีรัมย์", healthZone: 9 },
  { name: "สุรินทร์", healthZone: 9 },
  { name: "ชัยภูมิ", healthZone: 9 },
  { name: "อุบลราชธานี", healthZone: 10 },
  { name: "ศรีสะเกษ", healthZone: 10 },
  { name: "ยโสธร", healthZone: 10 },
  { name: "มุกดาหาร", healthZone: 10 },
  { name: "สุราษฎร์ธานี", healthZone: 11 },
  { name: "นครศรีธรรมราช", healthZone: 11 },
  { name: "ภูเก็ต", healthZone: 11 },
  { name: "กระบี่", healthZone: 11 },
  { name: "ชุมพร", healthZone: 11 },
  { name: "สงขลา", healthZone: 12 },
  { name: "ตรัง", healthZone: 12 },
  { name: "พัทลุง", healthZone: 12 },
  { name: "ปัตตานี", healthZone: 12 },
  { name: "ยะลา", healthZone: 12 },
  { name: "กรุงเทพมหานคร", healthZone: 13 },
];

export const DISTRICTS = [
  "เมือง",
  "บ้านโป่ง",
  "ท่าม่วง",
  "ปากช่อง",
  "หนองบัว",
  "ศรีราชา",
  "สันทราย",
  "แม่ริม",
  "บางละมุง",
  "วารินชำราบ",
  "กันทรลักษ์",
  "นางรอง",
  "ชุมแพ",
  "พล",
  "เทิง",
  "จอมทอง",
  "ทุ่งสง",
  "หาดใหญ่",
  "สิชล",
  "ขลุง",
  "ดอยสะเก็ด",
  "แม่สาย",
  "สูงเนิน",
  "ด่านขุนทด",
  "กุมภวาปี",
];

/** ชื่อหน่วยบริการต้องสอดคล้องกับประเภท ไม่ใช่ตั้งชื่อ รพ. ให้ร้านยา */
export const NAME_PATTERN: Record<
  ProviderType,
  (district: string, province: string) => string
> = {
  regional_hospital: (_d, province) => `โรงพยาบาล${province}`,
  general_hospital: (_d, province) => `โรงพยาบาล${province}`,
  community_hospital: (district) => `โรงพยาบาล${district}`,
  health_promoting_hospital: (district) => `รพ.สต.${district}`,
  specialized_hospital: (_d, province) => `โรงพยาบาลจิตเวช${province}`,
  other_affiliation_hospital: (_d, province) => `โรงพยาบาลค่าย${province}`,
  private_hospital: (district) => `โรงพยาบาลเอกชน${district}`,
  clinic: (district) => `คลินิกเวชกรรม${district}`,
  pharmacy: (district) => `ร้านยาคุณภาพ${district}`,
  other: (district) => `หน่วยบริการ${district}`,
};

/**
 * สัดส่วนจำนวนหน่วยบริการแต่ละประเภทในระบบจริง
 * รพ.สต. กับคลินิกมีเยอะกว่า รพ.ศูนย์มาก
 */
export const TYPE_DISTRIBUTION: { type: ProviderType; weight: number }[] = [
  { type: "health_promoting_hospital", weight: 0.46 },
  { type: "clinic", weight: 0.18 },
  { type: "community_hospital", weight: 0.14 },
  { type: "pharmacy", weight: 0.09 },
  { type: "general_hospital", weight: 0.055 },
  { type: "private_hospital", weight: 0.03 },
  { type: "regional_hospital", weight: 0.015 },
  { type: "specialized_hospital", weight: 0.012 },
  { type: "other_affiliation_hospital", weight: 0.012 },
  { type: "other", weight: 0.006 },
];
