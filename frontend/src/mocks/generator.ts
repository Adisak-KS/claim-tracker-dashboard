import {
  PROVIDER_TYPE_INFO,
  type Provider,
  type ProviderType,
  type SourceSystem,
} from "@/lib/domain/provider";
import type {
  DashboardSummary,
  IssueGroupRank,
  ProviderSummary,
  ProviderMovement,
  ProviderTypeBreakdown,
  SourceSystemBreakdown,
  TrendPoint,
} from "@/lib/domain/summary";
import "@/lib/schemes";
import { NHSO_ISSUES, NHSO_13F_ID } from "@/lib/schemes/nhso-13f";
import type {
  AuthorityResponse,
  ClaimOutcome,
  SubmissionBatch,
} from "@/lib/domain/claim";
import { getIssue, getScheme } from "@/lib/domain/scheme";
import { REGISTRY } from "./moph-registry";

/** ข้อมูลจำลองต้องคงที่ทุกครั้ง ไม่งั้นแยกไม่ออกว่าเลขเปลี่ยนเพราะแก้โค้ดหรือเพราะสุ่มใหม่ */
function createRng(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export const TOTAL_PROVIDERS = REGISTRY.length;

/** ขนาดการส่งต่อวันต่างกันตามประเภท คลินิกกับ รพ.ศูนย์ ต่างกันหลักร้อยเท่า */
const VOLUME_BY_TYPE: Record<ProviderType, [number, number]> = {
  regional_hospital: [3200, 6800],
  general_hospital: [1400, 3600],
  community_hospital: [320, 1100],
  non_moph_hospital: [280, 1200],
  non_ops_hospital: [260, 1100],
  private_hospital: [180, 1400],
  health_promoting_hospital: [25, 180],
  urban_health_center: [40, 260],
  health_center: [35, 240],
  lao_health_center: [20, 160],
  hospital_branch: [30, 200],
  community_health_facility: [10, 90],
  primary_care_unit: [15, 120],
  private_clinic: [12, 140],
  district_health_office: [8, 70],
  provincial_health_office: [10, 95],
  academic_center: [15, 130],
};

/** รพ.สต. คลินิก และหน่วยเล็กมักใช้ระบบที่ต่างจาก รพ. ใหญ่ */
const SMALL_TIER_SYSTEMS: SourceSystem[] = ["EHP", "NHIP"];

let providerCache: Provider[] | null = null;

export function getProviders(): Provider[] {
  if (providerCache) return providerCache;
  const rng = createRng(20260912);

  providerCache = REGISTRY.map((entry) => {
    const isSmall = PROVIDER_TYPE_INFO[entry.type].tier === "small";
    const sourceSystem: SourceSystem = isSmall
      ? pick(rng, SMALL_TIER_SYSTEMS)
      : rng() < 0.8
        ? "HOSxP"
        : pick<SourceSystem>(rng, ["EHP", "NHIP", "OTHER"]);

    return {
      newCode: entry.newCode,
      legacyCode: entry.legacyCode,
      shortCode: entry.shortCode,
      name: entry.name,
      type: entry.type,
      province: entry.province,
      healthZone: entry.healthZone,
      sourceSystem,
    };
  });

  return providerCache;
}

const ISSUE_WEIGHT: Record<string, number> = {
  LOCAL_NO_INVOICE: 0.24,
  NHSO_5102: 0.16,
  C001: 0.13,
  LOCAL_CORRUPT_MONEY: 0.1,
  G01: 0.08,
  P01: 0.07,
  AUTH_TOKEN: 0.06,
  L100: 0.05,
  R01: 0.04,
  G30: 0.03,
  S1802: 0.02,
  D30: 0.01,
  A52: 0.008,
  LOCAL_BUILD_ERROR: 0.002,
};

function weightedIssue(rng: () => number): string {
  const roll = rng();
  let acc = 0;
  for (const issue of NHSO_ISSUES) {
    acc += ISSUE_WEIGHT[issue.code] ?? 0;
    if (roll <= acc) return issue.code;
  }
  return "LOCAL_NO_INVOICE";
}

let summaryCache: ProviderSummary[] | null = null;

export function getProviderSummaries(): ProviderSummary[] {
  if (summaryCache) return summaryCache;
  const rng = createRng(884412);
  const now = Date.now();

  summaryCache = getProviders().map((p) => {
    const [min, max] = VOLUME_BY_TYPE[p.type];
    const totalSent = Math.round(min + rng() * (max - min));

    // ส่วนใหญ่ส่งผ่านหมด ปัญหากระจุกที่ส่วนน้อย
    const healthRoll = rng();
    const baseRate =
      healthRoll > 0.97
        ? 45 + rng() * 35
        : healthRoll > 0.88
          ? 80 + rng() * 12
          : healthRoll > 0.62
            ? 92 + rng() * 6
            : 100;

    // NHIP ตั้งใจให้แย่กว่าระบบอื่น เพื่อพิสูจน์ว่าหน้าจอจับความผิดปกติรายระบบได้
    const successRate =
      p.sourceSystem === "NHIP" ? baseRate * (0.78 + rng() * 0.08) : baseRate;

    const successCount = Math.round((totalSent * successRate) / 100);
    const remaining = totalSent - successCount;
    const pendingCount = Math.round(remaining * rng() * 0.35);
    const failedCount = remaining - pendingCount;

    const isSilent = rng() < 0.025;
    const lastSentAt = isSilent
      ? new Date(now - (26 + rng() * 90) * 3_600_000).toISOString()
      : new Date(now - rng() * 8 * 3_600_000).toISOString();

    return {
      ...p,
      totalSent,
      successCount,
      failedCount,
      pendingCount,
      successRate: Number(((successCount / totalSent) * 100).toFixed(1)),
      topIssueCode: failedCount > 0 ? weightedIssue(rng) : null,
      lastSentAt,
      isSilent,
    };
  });

  return summaryCache;
}

/** ห้ามใช้ toISOString เพราะจะเลื่อนเป็น UTC แล้ววันคลาดไป 1 วัน */
function toLocalDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function buildTrend(
  days: number,
  endDate: Date,
  dailyAverage: number,
  successRatePct: number,
): TrendPoint[] {
  const rng = createRng(5521);
  const points: TrendPoint[] = [];
  const baseFailRate = (100 - successRatePct) / 100;

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const isLast = i === 0;
    const weekday = d.getDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.42 : 1;

    const sent = Math.round(
      dailyAverage * (isLast ? 1 : 0.86 + rng() * 0.28) * weekendFactor,
    );
    const failRate = isLast ? baseFailRate : baseFailRate * (0.75 + rng() * 0.6);
    const failed = Math.round(sent * failRate);

    points.push({ date: toLocalDate(d), success: sent - failed, failed });
  }

  return points;
}

export function getIssueGroupRanks(scale = 1): IssueGroupRank[] {
  const rng = createRng(77301);
  const scheme = getScheme(NHSO_13F_ID);
  const summaries = getProviderSummaries();
  const totalFailed = summaries.reduce((sum, s) => sum + s.failedCount, 0);
  const withIssues = summaries.filter((s) => s.failedCount > 0).length;

  const byGroup = new Map<string, IssueGroupRank>();

  for (const issue of NHSO_ISSUES) {
    const weight = ISSUE_WEIGHT[issue.code] ?? 0;
    if (weight === 0) continue;

    const count = Math.round(totalFailed * weight * scale);
    const group = byGroup.get(issue.groupId);

    if (group) {
      group.count += count;
      group.topCodes.push({ code: issue.code, label: issue.label, count });
    } else {
      const info = scheme?.issueGroups.find((g) => g.id === issue.groupId);
      byGroup.set(issue.groupId, {
        groupId: issue.groupId,
        label: info?.label ?? issue.groupId,
        count,
        affectedProviders: 0,
        share: 0,
        trendPct: Number((rng() * 70 - 28).toFixed(1)),
        topCodes: [{ code: issue.code, label: issue.label, count }],
      });
    }
  }

  const ranks = [...byGroup.values()];
  const sum = ranks.reduce((acc, r) => acc + r.count, 0) || 1;

  return ranks
    .map((r) => ({
      ...r,
      share: Number(((r.count / sum) * 100).toFixed(1)),
      affectedProviders: Math.round(withIssues * (r.count / sum)),
      topCodes: r.topCodes.sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.count - a.count);
}

function buildTypeBreakdown(scale: number): ProviderTypeBreakdown[] {
  const summaries = getProviderSummaries();
  const byType = new Map<ProviderType, ProviderTypeBreakdown>();

  for (const s of summaries) {
    const existing = byType.get(s.type);
    const row = existing ?? {
      type: s.type,
      label: PROVIDER_TYPE_INFO[s.type].label,
      providerCount: 0,
      sent: 0,
      success: 0,
      failed: 0,
      successRate: 0,
      strugglingCount: 0,
    };

    row.providerCount += 1;
    row.sent += s.totalSent * scale;
    row.success += s.successCount * scale;
    row.failed += s.failedCount * scale;
    if (s.successRate < 80) row.strugglingCount += 1;

    if (!existing) byType.set(s.type, row);
  }

  return [...byType.values()]
    .map((r) => ({
      ...r,
      sent: Math.round(r.sent),
      success: Math.round(r.success),
      failed: Math.round(r.failed),
      successRate: Number(((r.success / (r.sent || 1)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.sent - a.sent);
}

/**
 * รายที่ส่งน้อยมากต้องตัดออก ไม่งั้นร้านยาที่ส่ง 3 รายการแล้วผ่านหมด
 * จะขึ้นอันดับ 1 ว่า "ดีขึ้น 100 จุด" ซึ่งเป็นความบังเอิญ ไม่ใช่ผลงาน
 */
const MIN_VOLUME_FOR_MOVEMENT = 120;

function buildMostImproved(scale: number): ProviderMovement[] {
  const rng = createRng(31517);

  return getProviderSummaries()
    .filter((p) => p.totalSent >= MIN_VOLUME_FOR_MOVEMENT)
    .map((p) => {
      /**
       * จำลองอัตราของช่วงก่อนหน้า ที่ดีขึ้นจริงจะมีช่องว่างกว้าง
       * คิดเป็นสัดส่วนของอัตราปัจจุบัน ไม่ใช่ลบค่าคงที่แล้วตัดที่พื้น
       * เพราะถ้าตัดพื้น รายที่อัตราสูงจะชนเพดานเดียวกันหมดแล้วได้ส่วนต่างเท่ากันทุกแถว
       */
      const improved = rng() < 0.18;
      const previousRate = improved
        ? p.successRate * (0.42 + rng() * 0.34)
        : Math.max(20, Math.min(99.9, p.successRate + (rng() * 16 - 8)));

      return {
        newCode: p.newCode,
        name: p.name,
        type: p.type,
        province: p.province,
        sourceSystem: p.sourceSystem,
        previousRate: Number(previousRate.toFixed(1)),
        currentRate: p.successRate,
        deltaPoints: Number((p.successRate - previousRate).toFixed(1)),
        sent: Math.round(p.totalSent * scale),
      };
    })
    .sort((a, b) => b.deltaPoints - a.deltaPoints)
    .slice(0, 5);
}

function buildSystemBreakdown(
  scale: number,
  overallRate: number,
): SourceSystemBreakdown[] {
  const summaries = getProviderSummaries();
  const bySystem = new Map<SourceSystem, SourceSystemBreakdown>();

  for (const s of summaries) {
    const existing = bySystem.get(s.sourceSystem);
    const row = existing ?? {
      system: s.sourceSystem,
      providerCount: 0,
      sent: 0,
      success: 0,
      failed: 0,
      successRate: 0,
      rateVsAverage: 0,
    };

    row.providerCount += 1;
    row.sent += s.totalSent * scale;
    row.success += s.successCount * scale;
    row.failed += s.failedCount * scale;

    if (!existing) bySystem.set(s.sourceSystem, row);
  }

  return [...bySystem.values()]
    .map((r) => {
      const rate = (r.success / (r.sent || 1)) * 100;
      return {
        ...r,
        sent: Math.round(r.sent),
        success: Math.round(r.success),
        failed: Math.round(r.failed),
        successRate: Number(rate.toFixed(1)),
        rateVsAverage: Number((rate - overallRate).toFixed(1)),
      };
    })
    .sort((a, b) => b.sent - a.sent);
}

/**
 * คะแนนความเร่งด่วน: รวมอัตราที่พังกับปริมาณที่กระทบ
 * เรียงด้วยจำนวนดิบอย่างเดียวไม่ได้ เพราะคลินิกที่พัง 100% จะไม่มีวันติดอันดับ
 */
function urgencyScore(p: ProviderSummary): number {
  const failRate = p.failedCount / (p.totalSent || 1);
  return failRate * Math.log10(p.failedCount + 10);
}

function parseRange(from: string | null, to: string | null) {
  const end = to ? new Date(`${to}T00:00:00`) : new Date();
  const start = from
    ? new Date(`${from}T00:00:00`)
    : new Date(end.getTime() - 6 * 86_400_000);

  const days = Math.max(
    1,
    Math.floor(
      (start > end ? 0 : end.getTime() - start.getTime()) / 86_400_000,
    ) + 1,
  );

  return { end, days };
}

export function getDashboardSummary(
  from: string | null = null,
  to: string | null = null,
): DashboardSummary {
  const { end, days } = parseRange(from, to);
  const summaries = getProviderSummaries();
  const scale = days / 7;
  const scheme = getScheme(NHSO_13F_ID);

  const totalSent = Math.round(
    summaries.reduce((sum, s) => sum + s.totalSent, 0) * scale,
  );
  const successCount = Math.round(
    summaries.reduce((sum, s) => sum + s.successCount, 0) * scale,
  );
  const failedCount = Math.round(
    summaries.reduce((sum, s) => sum + s.failedCount, 0) * scale,
  );
  const pendingCount = Math.round(
    summaries.reduce((sum, s) => sum + s.pendingCount, 0) * scale,
  );
  const successRate = (successCount / (totalSent || 1)) * 100;

  const trend = buildTrend(
    days,
    end,
    Math.round(totalSent / days),
    successRate,
  );
  const prevPoint = trend[trend.length - 2] ?? trend[trend.length - 1];
  const prevRate =
    (prevPoint.success / (prevPoint.success + prevPoint.failed || 1)) * 100;

  const providersNeedingHelp = [...summaries]
    .filter((p) => p.failedCount > 0)
    .sort((a, b) => urgencyScore(b) - urgencyScore(a))
    .slice(0, 8)
    .map((p) => ({
      ...p,
      totalSent: Math.round(p.totalSent * scale),
      successCount: Math.round(p.successCount * scale),
      failedCount: Math.round(p.failedCount * scale),
      pendingCount: Math.round(p.pendingCount * scale),
    }));

  return {
    schemeId: NHSO_13F_ID,
    range: { from: trend[0].date, to: trend[trend.length - 1].date },
    days,
    totalSent,
    successCount,
    failedCount,
    pendingCount,
    successRate: Number(successRate.toFixed(1)),
    successRateDeltaPct: Number((successRate - prevRate).toFixed(1)),
    totalProviders: TOTAL_PROVIDERS,
    providersWithIssues: summaries.filter((s) => s.failedCount > 0).length,
    silentProviders: summaries.filter((s) => s.isSilent).length,
    trend,
    topIssueGroups: getIssueGroupRanks(scale),
    fundBreakdown: (scheme?.funds ?? []).map((fund, index) => {
      const ratio = index === 0 ? 0.82 : 0.18;
      return {
        fundId: fund.id,
        label: fund.label,
        sent: Math.round(totalSent * ratio),
        success: Math.round(successCount * ratio),
        failed: Math.round(failedCount * ratio),
      };
    }),
    providerTypeBreakdown: buildTypeBreakdown(scale),
    sourceSystemBreakdown: buildSystemBreakdown(scale, successRate),
    mostImproved: buildMostImproved(scale),
    providersNeedingHelp,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * ข้อความจริงที่ สปสช. ตอบกลับมา ต่างจากคำอธิบายกลางของเราตรงที่ระบุเจาะจง
 * เช่นบอกเลขแฟ้ม seq และชื่อ field ที่ผิด ตามรูปแบบในเอกสาร
 * ตัวอย่าง C100: "แฟ้ม [File No.] Seq.[SEQ] ข้อมูล [Field Name] ..."
 */
const FILE_NAMES = ["IPD", "OPD", "CHA", "CHT", "DRU", "ADP", "AER"];
const FIELD_NAMES = [
  "CHARGE_CODE",
  "INVOICE_NO",
  "DATEADM",
  "DATEDSC",
  "TOTAL_AMOUNT",
  "INSCL",
];

function buildAuthorityResponses(
  rng: () => number,
  code: string,
  failed: number,
): AuthorityResponse[] {
  const issue = getIssue(NHSO_13F_ID, code);
  const file = pick(rng, FILE_NAMES);
  const field = pick(rng, FIELD_NAMES);
  const seq = 1 + Math.floor(rng() * Math.max(1, failed));

  const isLocal = code.startsWith("LOCAL_") || code === "AUTH_TOKEN";
  const message = isLocal
    ? (issue?.label ?? code)
    : `แฟ้ม ${file} Seq.${seq} ข้อมูล ${field} ${issue?.label ?? "ไม่ผ่านการตรวจสอบ"}`;

  return [
    {
      code,
      message,
      solution: issue?.remedy,
      allowClaim:
        issue?.resubmittable === null || issue?.resubmittable === undefined
          ? null
          : issue.resubmittable
            ? "Y"
            : "N",
    },
  ];
}

/**
 * batch ย้อนหลัง 14 วัน หน่วยบริการหนึ่งส่งได้หลายรอบต่อวัน
 * สร้างจาก summary เดิม ตัวเลขจึงสอดคล้องกับหน้าอื่น ไม่ใช่สุ่มแยกชุด
 */
let batchCache: SubmissionBatch[] | null = null;

const BATCH_HISTORY_DAYS = 14;

export function getSubmissionBatches(): SubmissionBatch[] {
  if (batchCache) return batchCache;

  const rng = createRng(662104);
  const now = Date.now();
  const rows: SubmissionBatch[] = [];

  for (const p of getProviderSummaries()) {
    const batchCount = 1 + Math.floor(rng() * 4);

    for (let i = 0; i < batchCount; i += 1) {
      const total = Math.max(1, Math.round((p.totalSent / batchCount) * (0.7 + rng() * 0.6)));
      const success = Math.round(total * (p.successRate / 100));
      const remaining = total - success;
      const pending = Math.round(remaining * rng() * 0.4);
      const failed = remaining - pending;

      const outcome: ClaimOutcome =
        failed > 0 ? "failed" : pending > 0 ? "pending" : "success";
      const topIssue = failed > 0 ? weightedIssue(rng) : null;

      rows.push({
        batchId: `B${String(rows.length + 1).padStart(7, "0")}`,
        schemeId: NHSO_13F_ID,
        providerCode: p.newCode,
        providerName: p.name,
        province: p.province,
        sourceSystem: p.sourceSystem,
        submittedAt: new Date(
          now - rng() * BATCH_HISTORY_DAYS * 86_400_000,
        ).toISOString(),
        total,
        success,
        failed,
        pending,
        outcome,
        topIssueCode: topIssue,
        authorityResponses: topIssue
          ? buildAuthorityResponses(rng, topIssue, failed)
          : undefined,
      });
    }
  }

  batchCache = rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return batchCache;
}

/**
 * อันดับหน่วยบริการที่ส่งสำเร็จมากที่สุด ผู้บริหารขอดู Top N
 * เรียงตามจำนวนที่สำเร็จ ไม่ใช่อัตรา เพราะอัตรา 100% จากการส่ง 5 รายการไม่มีความหมาย
 * แต่ยังแสดงอัตราคู่กันไว้ ผู้ใช้จะได้ไม่เข้าใจผิดว่ารายใหญ่คือรายที่ทำงานดีเสมอ
 */
export function getTypeBreakdown(): ProviderTypeBreakdown[] {
  return buildTypeBreakdown(1);
}

export function getTopProviders(limit: number): ProviderSummary[] {
  return [...getProviderSummaries()]
    .sort((a, b) => b.successCount - a.successCount)
    .slice(0, limit);
}
