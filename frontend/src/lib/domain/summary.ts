import type { Provider, ProviderType, SourceSystem } from "./provider";
import type { SchemeId } from "./scheme";

export interface ProviderSummary extends Provider {
  totalSent: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
  /** รหัสปัญหาที่เจอมากสุดของหน่วยบริการนี้ */
  topIssueCode: string | null;
  lastSentAt: string | null;
  /** เคยส่งแล้วจู่ ๆ หยุดส่ง อันตรายกว่าส่งไม่สำเร็จเพราะไม่มี error ให้เห็น */
  isSilent: boolean;
}

export interface IssueGroupRank {
  groupId: string;
  label: string;
  count: number;
  affectedProviders: number;
  share: number;
  /** ค่าบวกคือแย่ลง เทียบกับช่วงก่อนหน้าที่ยาวเท่ากัน */
  trendPct: number;
  /** รหัสย่อยในกลุ่มนี้ เรียงตามจำนวน */
  topCodes: { code: string; label: string; count: number }[];
}

export interface TrendPoint {
  date: string;
  success: number;
  failed: number;
}

export interface FundBreakdown {
  fundId: string;
  label: string;
  sent: number;
  success: number;
  failed: number;
}

/** สรุปแยกตามประเภทหน่วยบริการ เพราะขนาดต่างกันหลักร้อยเท่า */
export interface ProviderTypeBreakdown {
  type: ProviderType;
  label: string;
  providerCount: number;
  sent: number;
  success: number;
  failed: number;
  successRate: number;
  /** จำนวนหน่วยบริการที่อัตราสำเร็จต่ำกว่าเกณฑ์ */
  strugglingCount: number;
}

/**
 * สรุปตามระบบต้นทาง เป็นมุมที่ต่างจากมุมอื่นตรงที่ระบบเป็นของทีมเราเอง
 * ถ้าระบบใดอัตราสำเร็จต่ำผิดปกติ แปลว่าน่าจะเป็นบั๊กของระบบนั้น
 * ไม่ใช่ความผิดของหน่วยบริการ คนละทางแก้กันสิ้นเชิง
 */
export interface SourceSystemBreakdown {
  system: SourceSystem;
  providerCount: number;
  sent: number;
  success: number;
  failed: number;
  successRate: number;
  /** ห่างจากค่าเฉลี่ยรวมกี่จุด ค่าลบมากคือผิดปกติ */
  rateVsAverage: number;
}

/**
 * เทียบก่อนกับหลังรายหน่วยบริการ ใช้รูปแบบ dumbbell
 * ไม่ใช้ "อันดับส่งสำเร็จมากสุด" เพราะรายใหญ่จะชนะตลอดโดยไม่ได้แปลว่าทำงานดี
 * และไม่ใช้อัตราสูงสุด เพราะรายที่ส่ง 5 รายการผ่านหมดจะได้ 100% ซึ่งไม่มีความหมาย
 */
export interface ProviderMovement {
  code: string;
  name: string;
  type: ProviderType;
  province: string;
  sourceSystem: SourceSystem;
  previousRate: number;
  currentRate: number;
  /** จุดที่เปลี่ยนไป ค่าบวกคือดีขึ้น */
  deltaPoints: number;
  /** ปริมาณที่ส่งในช่วงนี้ ใช้กันไม่ให้รายเล็กมากติดอันดับด้วยความบังเอิญ */
  sent: number;
}

export interface DashboardSummary {
  schemeId: SchemeId;
  range: { from: string; to: string };
  days: number;
  totalSent: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
  successRateDeltaPct: number;
  totalProviders: number;
  providersWithIssues: number;
  silentProviders: number;
  trend: TrendPoint[];
  topIssueGroups: IssueGroupRank[];
  fundBreakdown: FundBreakdown[];
  providerTypeBreakdown: ProviderTypeBreakdown[];
  sourceSystemBreakdown: SourceSystemBreakdown[];
  mostImproved: ProviderMovement[];
  /**
   * เรียงด้วยคะแนนความเร่งด่วน ไม่ใช่จำนวนดิบ
   * ไม่งั้นคลินิกที่พัง 100% จะถูกกลบด้วย รพ.ศูนย์ที่พัง 10%
   */
  providersNeedingHelp: ProviderSummary[];
  generatedAt: string;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}
