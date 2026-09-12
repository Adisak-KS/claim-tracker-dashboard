import type { SchemeId } from "./scheme";

/**
 * คำศัพท์กลางที่ทุกประเภทการส่งเคลมใช้ร่วมกัน
 * รายละเอียดเฉพาะประเภท (รหัสสถานะ รหัสปัญหา ชื่อหน่วยงาน) อยู่ใน lib/schemes/
 */

/** ผลลัพธ์ระดับรายการ ใช้ได้กับทุกประเภท */
export const CLAIM_OUTCOME = {
  success: "success",
  failed: "failed",
  pending: "pending",
  cancelled: "cancelled",
} as const;

export type ClaimOutcome = (typeof CLAIM_OUTCOME)[keyof typeof CLAIM_OUTCOME];

export const CLAIM_OUTCOME_LABEL: Record<ClaimOutcome, string> = {
  success: "ส่งสำเร็จ",
  failed: "ส่งไม่สำเร็จ",
  pending: "ยังไม่ได้ส่ง",
  cancelled: "ยกเลิกแล้ว",
};

/** ไม่เก็บข้อมูลส่วนตัวผู้ป่วย อ้างอิงด้วยเลขที่หน่วยบริการใช้ภายในเท่านั้น */
export interface ClaimItemRef {
  vn: string;
  an?: string;
  /** hash เท่านั้น ห้ามเก็บ hn ดิบ */
  hnHash?: string;
}

export interface ClaimIssueRef {
  schemeId: SchemeId;
  code: string;
}

/**
 * ข้อความที่หน่วยงานปลายทางตอบกลับมาจริง ไม่ใช่ที่เราแปลเอง
 *
 * เจ้าหน้าที่ต้องเห็นของจริง เพราะข้อความจาก สปสช. มักระบุเจาะจงกว่าคำอธิบาย
 * ที่เราเขียนไว้ เช่นบอก seq หรือชื่อ field ที่ผิดมาด้วย
 * ซึ่งคำอธิบายกลางของเราบอกไม่ได้ เพราะเขียนไว้ครอบคลุมทุกเคส
 *
 * ที่มาโครงสร้าง: API Specification 13Plus v1.3.5.1
 * endpoint POST /stddataset/api/v2/status-tracks/details
 * ฟิลด์ results[] มี code, message, solution, allowClaim
 */
export interface AuthorityResponse {
  /** รหัสที่หน่วยงานปลายทางส่งกลับมา */
  code: string;
  /** ข้อความดิบจากหน่วยงานปลายทาง ห้ามแก้ไขหรือแปล */
  message: string;
  /** วิธีแก้ที่หน่วยงานปลายทางแนะนำ บางรหัสไม่ส่งมา */
  solution?: string;
  /** Y = แก้แล้วส่งเบิกใหม่ได้ N = จบแล้ว ต้องอุทธรณ์ */
  allowClaim: "Y" | "N" | null;
}

/**
 * 1 batch คือการกดส่ง 1 ครั้งของหน่วยบริการ ไม่ใช่ 1 รายการผู้ป่วย
 * หน้าจอแสดงระดับ batch เพราะผู้ใช้ติดตามเป็นรอบการส่ง ไม่ได้ไล่ดูรายคน
 */
export interface SubmissionBatch {
  batchId: string;
  schemeId: SchemeId;
  providerCode: string;
  providerName: string;
  province: string;
  sourceSystem: string;
  submittedAt: string;
  total: number;
  success: number;
  failed: number;
  pending: number;
  outcome: ClaimOutcome;
  /** รหัสปัญหาที่พบมากที่สุดใน batch นี้ */
  topIssueCode: string | null;
  /** ข้อความที่หน่วยงานปลายทางตอบกลับมาจริง */
  authorityResponses?: AuthorityResponse[];
}
