/**
 * ลงทะเบียนประเภทการส่งเคลมทั้งหมดที่นี่ที่เดียว
 * เพิ่มประเภทใหม่: สร้างไฟล์ใน lib/schemes/ แล้ว import เข้ามาบรรทัดเดียว
 * ไม่ต้องแก้หน้าจอหรือโค้ดส่วนกลางเลย
 */
import "./nhso-13f";

export { NHSO_13F_ID } from "./nhso-13f";
export {
  getDefaultScheme,
  getScheme,
  listSchemes,
  type SchemeDefinition,
} from "@/lib/domain/scheme";
