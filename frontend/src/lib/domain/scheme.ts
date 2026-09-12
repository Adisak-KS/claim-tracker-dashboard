/**
 * ประเภทการส่งเคลม (scheme) คือแกนกลางที่ทำให้ระบบรองรับของใหม่ได้
 * ตอนนี้มีแค่ nhso-13f แต่โครงนี้รองรับประกันสังคม กรมบัญชีกลาง หรืออะไรก็ได้
 *
 * กฎ: โค้ดส่วนกลางห้ามพูดถึง "สปสช." ตรง ๆ ให้อ่านจาก SchemeDefinition เสมอ
 * ไม่งั้นพอมีประเภทที่ 2 หน้าจอจะขึ้นชื่อหน่วยงานผิด
 */

export type SchemeId = string;

export interface StatusStage {
  id: string;
  label: string;
  /** เงินเดินทางถึงไหนแล้ว ใช้จัดกลุ่มสถานะย่อยให้ผู้บริหารเข้าใจ */
  tone: "pending" | "processing" | "success" | "failed";
}

export interface SchemeStatus {
  code: string;
  label: string;
  stageId: string;
}

export interface SchemeIssue {
  code: string;
  label: string;
  /** วิธีแก้ที่หน่วยงานปลายทางกำหนด ไม่ใช่เราแต่งเอง */
  remedy: string;
  /** แก้แล้วส่งใหม่ได้ไหม บางหน่วยงานมีธงนี้ บางที่ไม่มี */
  resubmittable: boolean | null;
  /** กลุ่มปัญหา ใช้จัดอันดับแทนการเรียงรหัสย่อยที่มีเป็นร้อย */
  groupId: string;
}

export interface IssueGroup {
  id: string;
  label: string;
  description: string;
}

export interface SchemeDefinition {
  id: SchemeId;
  /** ชื่อที่แสดงในเมนูและตัวกรอง */
  label: string;
  /** ชื่อเต็มของชุดข้อมูลที่ส่ง */
  datasetLabel: string;
  /** หน่วยงานปลายทางที่รับเคลม ใช้แทนคำว่า "สปสช." ในข้อความทั้งระบบ */
  authorityName: string;
  authorityShortName: string;
  /** กองทุนย่อยภายใต้ประเภทนี้ */
  funds: { id: string; label: string }[];
  stages: StatusStage[];
  issueGroups: IssueGroup[];
  /** true = ประเภทนี้พร้อมใช้งานจริงแล้ว */
  enabled: boolean;
}

const registry = new Map<SchemeId, SchemeDefinition>();

export function registerScheme(definition: SchemeDefinition): void {
  registry.set(definition.id, definition);
}

export function getScheme(id: SchemeId): SchemeDefinition | undefined {
  return registry.get(id);
}

export function listSchemes(): SchemeDefinition[] {
  return [...registry.values()].filter((s) => s.enabled);
}

/** ประเภทที่ใช้เมื่อผู้ใช้ยังไม่ได้เลือก */
export function getDefaultScheme(): SchemeDefinition {
  const first = listSchemes()[0];
  if (!first) throw new Error("ยังไม่ได้ลงทะเบียนประเภทการส่งเคลมใด ๆ");
  return first;
}
