"use client";

import { useState } from "react";
import { CircleCheck, CircleSlash, Info, Wrench, X } from "lucide-react";
import { ModalPortal } from "@/components/ui/modal-portal";
import { getIssue, type SchemeId } from "@/lib/domain/scheme";
import { cn } from "@/lib/utils";

/**
 * ช่องปัญหาในตาราง
 *
 * แสดงชื่อสั้นให้อ่านเร็ว แต่เจ้าหน้าที่ต้องกดดูรายละเอียดเต็มได้
 * เพราะเวลาโทรหาหน่วยบริการต้องบอก 3 อย่าง
 * 1. รหัสจริงที่หน่วยงานปลายทางส่งกลับมา (หน่วยบริการเอาไปค้นในระบบตัวเองได้)
 * 2. ปัญหาคืออะไร
 * 3. ต้องทำอะไรต่อ
 *
 * ใช้ tooltip อย่างเดียวไม่พอ เพราะบนมือถือไม่มี hover
 * และข้อความวิธีแก้ยาวเกินกว่าจะยัดใน tooltip ให้อ่านสบาย
 */
export function IssueCell({
  schemeId,
  code,
}: {
  schemeId: SchemeId;
  code: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!code) {
    return <span className="text-muted-foreground">ไม่มี</span>;
  }

  const issue = getIssue(schemeId, code);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex cursor-pointer items-center gap-1.5 text-left transition-colors hover:text-foreground"
        aria-label={`ดูรายละเอียดปัญหา ${issue?.label ?? code}`}
      >
        <span className="line-clamp-2 break-words">{issue?.label ?? code}</span>
        <Info
          className="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary"
          aria-hidden
        />
      </button>

      {open && (
        <IssueDetailDialog
          schemeId={schemeId}
          code={code}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function IssueDetailDialog({
  schemeId,
  code,
  onClose,
}: {
  schemeId: SchemeId;
  code: string;
  onClose: () => void;
}) {
  const issue = getIssue(schemeId, code);

  return (
    <ModalPortal onClose={onClose} label="รายละเอียดปัญหา">
      <div
        className="animate-pop flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-surface-muted/40 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {issue?.label ?? "ไม่พบคำอธิบายของรหัสนี้"}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              รหัส {code}
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

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {issue ? (
            <>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Wrench className="size-3.5" aria-hidden />
                  ต้องทำอะไรต่อ
                </p>
                <p className="text-sm text-foreground">{issue.remedy}</p>
              </div>

              <ResubmitNote value={issue.resubmittable} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              ระบบยังไม่มีคำอธิบายของรหัสนี้ กรุณาแจ้งทีม BMS พร้อมรหัส {code}
              เพื่อเพิ่มคำอธิบายและวิธีแก้เข้าระบบ
            </p>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}

/** แยก "แก้แล้วส่งใหม่ได้" ออกจาก "จบแล้ว" เพราะคนละงานกันสิ้นเชิง */
function ResubmitNote({ value }: { value: boolean | null }) {
  if (value === null) {
    return (
      <p className="rounded-[var(--radius)] bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
        หน่วยงานปลายทางไม่ได้ระบุว่าส่งใหม่ได้หรือไม่ ให้ติดต่อสอบถามก่อนดำเนินการ
      </p>
    );
  }

  const Icon = value ? CircleCheck : CircleSlash;

  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-[var(--radius)] border px-3 py-2 text-sm",
        value
          ? "border-success-border bg-success-surface text-success"
          : "border-danger-border bg-danger-surface text-danger",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {value
        ? "แก้ข้อมูลแล้วส่งเบิกใหม่ได้ ยังมีโอกาสได้รับเงิน"
        : "รายการนี้ส่งเบิกใหม่ไม่ได้แล้ว ต้องยื่นอุทธรณ์กับหน่วยงานปลายทาง"}
    </p>
  );
}
