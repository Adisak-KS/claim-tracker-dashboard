"use client";

import { useEffect } from "react";
import { Copy, X } from "lucide-react";
import { AuthorityMessage } from "@/components/ui/authority-message";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { getStatusLabel, type SchemeId } from "@/lib/domain/scheme";
import {
  CLAIM_OUTCOME_LABEL,
  type ClaimRecord,
  type ClaimOutcome,
} from "@/lib/domain/claim";
import { formatDateTimeTH } from "@/lib/utils";

const OUTCOME_TONE: Record<ClaimOutcome, StatusTone> = {
  success: "success",
  failed: "danger",
  pending: "warning",
  cancelled: "neutral",
};

export interface ClaimRecordDetail extends ClaimRecord {
  batchId: string;
  submittedAt: string;
}

/**
 * ผลการส่งเคลมรายตัวแบบเต็ม
 *
 * ใช้ modal ไม่ใช่กางในตาราง เพราะข้อความจาก สปสช. ยาวไม่จำกัด
 * ถ้ากางในตารางจะดันแถวอื่นและถูกจำกัดด้วยความกว้างคอลัมน์
 *
 * 🔴 ข้อความดิบต้องแสดงครบ ห้ามตัดด้วย line-clamp หรือย่อ
 * เจ้าหน้าที่ต้องอ่านครบเพื่อเอาไปแจ้งหน่วยบริการและอ้างอิงกับ สปสช.
 */
export function ClaimRecordDialog({
  record,
  schemeId,
  onClose,
}: {
  record: ClaimRecordDetail;
  schemeId: SchemeId;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function copyDetail() {
    const lines = [
      `VN ${record.vn}`,
      `รอบการส่ง ${record.batchId}`,
      `ส่งเมื่อ ${formatDateTimeTH(record.submittedAt)}`,
      `ผลลัพธ์ ${CLAIM_OUTCOME_LABEL[record.outcome]}`,
      "",
      ...(record.responses ?? []).map((response) =>
        [
          `รหัส ${response.code}`,
          response.message,
          response.solution ? `วิธีแก้ ${response.solution}` : "",
          response.allowClaim === "N"
            ? "ส่งเบิกใหม่ไม่ได้ ต้องอุทธรณ์"
            : response.allowClaim === "Y"
              ? "แก้แล้วส่งเบิกใหม่ได้"
              : "",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      // บางเบราว์เซอร์ไม่ให้สิทธิ์คัดลอก ปล่อยผ่าน ผู้ใช้เลือกข้อความเองได้
    }
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`ผลการส่งเคลม VN ${record.vn}`}
      onClick={onClose}
    >
      <div
        className="animate-pop my-8 w-full max-w-2xl rounded-[var(--radius)] border border-border bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-foreground">
                VN {record.vn}
              </span>
              <StatusBadge
                tone={OUTCOME_TONE[record.outcome]}
                label={CLAIM_OUTCOME_LABEL[record.outcome]}
              />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ส่งเมื่อ {formatDateTimeTH(record.submittedAt)} · รอบการส่ง{" "}
              <span className="font-mono">{record.batchId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              สถานะจาก {getStatusLabel(schemeId, record.statusCode)}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              รหัสสถานะ {record.statusCode}
            </p>
          </div>

          {record.responses?.length ? (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                ข้อความที่ตอบกลับ {record.responses.length} รายการ
              </p>
              <div className="space-y-2">
                {record.responses.map((response) => (
                  <AuthorityMessage key={response.code} response={response} />
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-[var(--radius)] bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
              รายการนี้ไม่มีข้อความแจ้งกลับ แปลว่าผ่านการตรวจสอบตามปกติ
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="secondary" icon={Copy} onClick={copyDetail}>
            คัดลอกรายละเอียด
          </Button>
          <Button variant="ghost" onClick={onClose}>
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
