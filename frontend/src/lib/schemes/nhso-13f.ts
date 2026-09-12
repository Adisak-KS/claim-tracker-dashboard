import {
  registerScheme,
  type SchemeDefinition,
  type SchemeIssue,
  type SchemeStatus,
} from "@/lib/domain/scheme";

/**
 * ประเภทการส่งเคลม 13 แฟ้ม ของ สปสช.
 * ที่มา: API Specification 13Plus (NHSO Digital Platform) v1.3.5.1
 * รหัสเต็มดูที่ docs/domain/nhso-status-codes.md และ nhso-error-codes.md
 * ห้ามเพิ่มรหัสใหม่โดยไม่ยืนยันกับเอกสารต้นทางก่อน
 */

export const NHSO_13F_ID = "nhso-13f";

const definition: SchemeDefinition = {
  id: NHSO_13F_ID,
  label: "13 แฟ้ม (สปสช.)",
  datasetLabel: "ชุดข้อมูลมาตรฐาน 13PLUS",
  authorityName: "สำนักงานหลักประกันสุขภาพแห่งชาติ",
  authorityShortName: "สปสช.",
  funds: [
    { id: "NHSO", label: "บัตรทอง (NHSO)" },
    { id: "FDH", label: "ผู้สูงอายุและผู้พิการ (FDH)" },
  ],
  stages: [
    { id: "import", label: "กำลังนำเข้า", tone: "pending" },
    { id: "submit", label: "รอส่งเบิก", tone: "pending" },
    { id: "processing", label: "รอประมวลผล", tone: "processing" },
    { id: "audit", label: "ระหว่างตรวจสอบ", tone: "processing" },
    { id: "payment", label: "รอจ่ายเงิน", tone: "processing" },
    { id: "paid", label: "จ่ายเงินแล้ว", tone: "success" },
    { id: "rejected", label: "ไม่ผ่าน", tone: "failed" },
  ],
  issueGroups: [
    {
      id: "C",
      label: "รหัสเบิกและค่าใช้จ่าย",
      description: "รหัสเบิกไม่ถูกต้อง เบิกซ้ำ หรือเงื่อนไขค่าใช้จ่ายไม่ครบ",
    },
    {
      id: "G",
      label: "สิทธิการรักษา",
      description: "สิทธิของผู้ป่วยไม่ตรงกับที่ขอเบิก",
    },
    {
      id: "D",
      label: "อุปกรณ์และครุภัณฑ์",
      description: "เบิกอุปกรณ์ผิดประเภทหรือไม่ครบเงื่อนไข",
    },
    {
      id: "S",
      label: "ค่าเดินทางและส่งต่อ",
      description: "รหัสค่าเดินทางหรือค่าพาหนะไม่ถูกต้อง",
    },
    {
      id: "P",
      label: "วันที่และช่วงเวลารักษา",
      description: "วันที่บริการทับซ้อนหรืออยู่นอกช่วงที่เบิกได้",
    },
    {
      id: "R",
      label: "การส่งต่อ (Refer)",
      description: "ถูกปฏิเสธการส่งต่อหรือข้อมูล refer ไม่ครบ",
    },
    {
      id: "L",
      label: "ข้อมูลอ้างอิงไม่พบ",
      description: "ค่าที่ส่งมาไม่มีในฐานข้อมูลมาตรฐาน",
    },
    {
      id: "AUTH",
      label: "การเชื่อมต่อและยืนยันตัวตน",
      description: "ตั้งค่า Token ผิด หรือยืนยันสิทธิไม่สำเร็จ",
    },
    {
      id: "LOCAL",
      label: "ข้อมูลต้นทางไม่พร้อม",
      description: "ข้อมูลฝั่งหน่วยบริการยังไม่ครบ จึงยังไม่ได้ส่งออกไป",
    },
  ],
  enabled: true,
};

/** สถานะที่ใช้บ่อย คัดจาก 66 รหัสเต็มในเอกสาร */
export const NHSO_STATUSES: SchemeStatus[] = [
  { code: "F000", label: "กำลังนำเข้าไฟล์", stageId: "import" },
  { code: "1100", label: "รอส่งเบิก", stageId: "submit" },
  { code: "1101", label: "ไม่ผ่านการตรวจสอบขั้นต้น", stageId: "rejected" },
  { code: "1102", label: "ส่งเบิกไม่สำเร็จ (ส่งซ้ำ)", stageId: "rejected" },
  { code: "1103", label: "ส่งเบิกแล้ว", stageId: "processing" },
  { code: "2000", label: "รอประมวลผลโดย สปสช.", stageId: "processing" },
  { code: "2100", label: "รอชี้แจงการ Authen", stageId: "audit" },
  { code: "3000", label: "ไม่ผ่านการประมวลผล", stageId: "rejected" },
  { code: "4000", label: "อยู่ระหว่างกระบวนการ Audit", stageId: "audit" },
  { code: "4100", label: "รอชี้แจงความผิดปกติ", stageId: "audit" },
  { code: "5000", label: "รอจ่ายเงิน", stageId: "payment" },
  { code: "5003", label: "โอนเงินไม่สำเร็จ", stageId: "rejected" },
  { code: "5005", label: "โอนเงินเรียบร้อย", stageId: "paid" },
  { code: "5007", label: "ไม่มีการจ่ายชดเชย", stageId: "rejected" },
  {
    code: "5102",
    label: "สิทธิไม่ตรงเงื่อนไข (OFC, LGO, BKK, UCS)",
    stageId: "rejected",
  },
  { code: "6000", label: "ไม่อนุมัติจ่าย", stageId: "rejected" },
];

/**
 * ปัญหาที่เจอบ่อย คัดจาก 654 รหัสเต็ม
 * ข้อความและวิธีแก้มาจากเอกสาร สปสช. โดยตรง ไม่ได้แต่งเอง
 * ยกเว้นกลุ่ม LOCAL กับ AUTH ที่มาจากโค้ดส่งเคลมฝั่งหน่วยบริการ
 */
export const NHSO_ISSUES: SchemeIssue[] = [
  {
    code: "LOCAL_NO_INVOICE",
    label: "ยังไม่มีเลขใบเสร็จ",
    remedy: "ให้หน่วยบริการออกใบเสร็จให้ครบก่อน แล้วกดส่งเคลมอีกครั้ง",
    resubmittable: true,
    groupId: "LOCAL",
  },
  {
    code: "LOCAL_CORRUPT_MONEY",
    label: "ยอดเงินไม่ถูกต้อง",
    remedy: "ตรวจสอบรายการค่ารักษาในเวชระเบียน แก้ยอดให้ถูกต้อง แล้วส่งใหม่",
    resubmittable: true,
    groupId: "LOCAL",
  },
  {
    code: "LOCAL_BUILD_ERROR",
    label: "เตรียมข้อมูลไม่สำเร็จ",
    remedy: "แจ้งทีม BMS พร้อมเลข VN เพื่อตรวจสอบข้อมูลต้นทาง",
    resubmittable: true,
    groupId: "LOCAL",
  },
  {
    code: "AUTH_TOKEN",
    label: "เชื่อมต่อไม่ได้ (Token)",
    remedy: "ตรวจสอบการตั้งค่า API Token ว่ายังไม่หมดอายุและกรอกถูกต้อง",
    resubmittable: true,
    groupId: "AUTH",
  },
  {
    code: "A52",
    label: "ไม่พบการยืนยันตัวตนในระบบ",
    remedy: "ประสานงานเพื่อขออุทธรณ์ไปที่ สปสช. เขต",
    resubmittable: false,
    groupId: "AUTH",
  },
  {
    code: "C001",
    label: "รหัสเบิกที่ส่งเข้าไม่ถูกต้อง",
    remedy: "ตรวจสอบรหัสเบิกให้ตรงตามรหัสมาตรฐาน แล้วส่งเข้ามาอีกครั้ง",
    resubmittable: false,
    groupId: "C",
  },
  {
    code: "G01",
    label: "หน่วยบริการไม่บันทึกข้อมูลระบุใช้สิทธิ UC",
    remedy: "บันทึกข้อมูลการใช้สิทธิให้ครบถ้วน แล้วส่งใหม่",
    resubmittable: false,
    groupId: "G",
  },
  {
    code: "G30",
    label: "บันทึกจำนวนเงินขอเบิกไม่ถูกต้อง",
    remedy: "ตรวจสอบจำนวนเงินที่ขอเบิกให้สอดคล้องกับรายการที่ให้บริการ",
    resubmittable: false,
    groupId: "G",
  },
  {
    code: "P01",
    label: "วันที่ให้บริการอยู่ในช่วงที่รักษาเป็นผู้ป่วยใน",
    remedy: "ตรวจสอบวันที่รับบริการให้ไม่ทับซ้อนกับช่วงนอนโรงพยาบาล",
    resubmittable: false,
    groupId: "P",
  },
  {
    code: "R01",
    label: "ข้อมูลถูกปฏิเสธการส่งต่อกรณี OP Refer",
    remedy: "ตรวจสอบรายละเอียดการปฏิเสธ และชี้แจงกับหน่วยบริการต้นสังกัด",
    resubmittable: false,
    groupId: "R",
  },
  {
    code: "L100",
    label: "ข้อมูลไม่มีในฐานข้อมูลมาตรฐาน",
    remedy: "ตรวจสอบรหัสที่ส่งว่าตรงกับฐานข้อมูลมาตรฐานปัจจุบันหรือไม่",
    resubmittable: false,
    groupId: "L",
  },
  {
    code: "S1802",
    label: "รหัสค่าเดินทางถูกยกเลิกแล้ว",
    remedy: "แก้ไขรหัสเบิกค่าเดินทางเป็น S1805 แล้วส่งข้อมูลใหม่",
    resubmittable: true,
    groupId: "S",
  },
  {
    code: "D30",
    label: "เบิกอุปกรณ์ไม่ตรงเงื่อนไข",
    remedy: "ตรวจสอบประเภทอุปกรณ์ที่เบิกให้ตรงตามหลักเกณฑ์",
    resubmittable: false,
    groupId: "D",
  },
  {
    code: "NHSO_5102",
    label: "สิทธิไม่ตรงเงื่อนไข (5102)",
    remedy:
      "ตรวจสอบสิทธิการรักษาของผู้ป่วยให้ตรงกับที่ขอเบิก แล้วยกเลิกเพื่อส่งใหม่",
    resubmittable: true,
    groupId: "G",
  },
];

registerScheme(definition);

export default definition;
