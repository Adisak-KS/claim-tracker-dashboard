"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Copy, MessageSquareWarning, X } from "lucide-react";
import { AuthorityMessage } from "@/components/ui/authority-message";
import { ModalPortal } from "@/components/ui/modal-portal";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { getStatusLabel, type SchemeId } from "@/lib/domain/scheme";
import {
  CLAIM_OUTCOME_LABEL,
  type AuthorityResponse,
  type ClaimRecord,
  type ClaimOutcome,
} from "@/lib/domain/claim";
import { cn, formatDateTimeTH } from "@/lib/utils";

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
  function detailText() {
    return [
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
    ].join("\n");
  }

  return (
    <ModalPortal onClose={onClose} label={`ผลการส่งเคลม VN ${record.vn}`}>
      {/* จำกัดความสูงไว้เท่าจอแล้วให้เนื้อหาเลื่อนข้างใน หัวกับท้ายจึงอยู่กับที่เสมอ */}
      <div
        className="animate-pop flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ยุบสถานะมาไว้ในหัวเลย เพราะเป็นข้อมูลระบุตัวรายการ ไม่ใช่เนื้อหาที่ต้องอ่านยาว */}
        <header className="shrink-0 border-b border-border bg-surface-muted/40 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold tracking-tight text-foreground">
                VN {record.vn}
              </span>
              <StatusBadge
                tone={OUTCOME_TONE[record.outcome]}
                label={CLAIM_OUTCOME_LABEL[record.outcome]}
              />
            </p>
            {/* เวลาชิดขวาคู่กับปุ่มปิด เพราะเป็นข้อมูลประกอบ ไม่ใช่สิ่งที่ต้องอ่านก่อน */}
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {formatDateTimeTH(record.submittedAt)}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิด"
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <dl className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <HeaderFact label="ส่งเมื่อ" className="sm:hidden">
              {formatDateTimeTH(record.submittedAt)}
            </HeaderFact>
            <HeaderFact label="รอบการส่ง" mono>
              {record.batchId}
            </HeaderFact>
            {/* สถานะคือสิ่งที่ผู้ใช้มองหาก่อน จึงเน้นด้วยพื้นหลังแทนที่จะเป็นข้อความเรียบ */}
            <div className="flex min-w-0 items-center gap-1.5">
              <dt className="shrink-0">สถานะ</dt>
              <dd className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5">
                <span className="truncate text-xs font-semibold text-foreground">
                  {getStatusLabel(schemeId, record.statusCode)}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {record.statusCode}
                </span>
              </dd>
            </div>
          </dl>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">

          {record.responses?.length ? (
            <>
              <section>
                <SectionTitle icon={MessageSquareWarning}>
                  ข้อความที่ตอบกลับ
                  <span className="ml-1.5 rounded-full bg-danger-surface px-2 py-0.5 text-xs font-semibold text-danger">
                    {record.responses.length}
                  </span>
                </SectionTitle>

                <div className="mt-2.5 space-y-2.5">
                  {record.responses.map((response, index) => (
                    <div key={response.code} className="flex gap-2.5">
                      <span className="mt-3 grid size-5 shrink-0 place-items-center rounded-full bg-surface-muted font-mono text-[11px] font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <AuthorityMessage
                        className="min-w-0 flex-1"
                        response={response}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <RawPayload responses={record.responses} />
            </>
          ) : (
            <p className="rounded-[var(--radius)] bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
              รายการนี้ไม่มีข้อความแจ้งกลับ แปลว่าผ่านการตรวจสอบตามปกติ
            </p>
          )}
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-border bg-surface-muted/40 px-5 py-3">
          <CopyButton text={detailText} label="คัดลอกรายละเอียด" />
          <Button variant="ghost" onClick={onClose}>
            ปิด
          </Button>
        </footer>
      </div>
    </ModalPortal>
  );
}

function HeaderFact({
  label,
  mono,
  className,
  children,
}: {
  label: string;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 items-baseline gap-1.5", className)}>
      <dt className="shrink-0">{label}</dt>
      <dd
        className={cn(
          "truncate font-medium text-foreground",
          mono && "font-mono",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
      {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
      {children}
    </h2>
  );
}

/** ยืนยันว่าคัดลอกแล้วด้วยไอคอนที่เปลี่ยนไป เพราะคลิปบอร์ดไม่มีสัญญาณอื่นให้ผู้ใช้เห็น */
function CopyButton({
  text,
  label,
  compact,
}: {
  text: () => string;
  label: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
    } catch {
      // บางเบราว์เซอร์ไม่ให้สิทธิ์คัดลอก ผู้ใช้ยังเลือกข้อความเองได้
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        title={label}
        className={cn(
          "grid size-7 cursor-pointer place-items-center rounded-[var(--radius)] border border-border bg-surface transition-colors",
          copied
            ? "text-success"
            : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        )}
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
      {copied ? "คัดลอกแล้ว" : label}
    </Button>
  );
}

/**
 * ข้อมูลดิบตามที่ได้รับจาก สปสช. ไม่ผ่านการจัดรูปแบบใด ๆ
 * เจ้าหน้าที่ต้องใช้ตอนแจ้งปัญหากลับไปที่ สปสช. เพราะต้องอ้างของที่ตรงกันเป๊ะ
 */
function RawPayload({ responses }: { responses: AuthorityResponse[] }) {
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(responses, null, 2);

  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-foreground transition-colors hover:text-primary"
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
          ข้อมูลดิบที่ได้รับ (results)
        </button>

        {open && <CopyButton compact text={() => json} label="คัดลอก JSON" />}
      </div>

      {open && (
        <pre className="mt-2 max-h-72 overflow-auto rounded-[var(--radius)] border border-border bg-surface-muted/60 p-3 font-mono text-xs leading-relaxed whitespace-pre">
          <JsonHighlight json={json} />
        </pre>
      )}
    </section>
  );
}

/**
 * ระบายสี JSON เองแทนการลงไลบรารี เพราะ payload นี้มีแค่ string กับ null
 * ไม่ต้องรองรับไวยากรณ์เต็มรูปแบบ และไลบรารีที่เล็กที่สุดก็ยังหนักกว่านี้มาก
 */
function JsonHighlight({ json }: { json: string }) {
  const parts = json.split(
    /("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|\bnull\b)/g,
  );

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.endsWith(":")) {
          return (
            <span key={index} className="font-semibold text-primary">
              {part}
            </span>
          );
        }
        if (part === "null") {
          return (
            <span key={index} className="text-warning">
              {part}
            </span>
          );
        }
        if (part.startsWith('"')) {
          return (
            <span key={index} className="text-success">
              {part}
            </span>
          );
        }
        return (
          <span key={index} className="text-muted-foreground">
            {part}
          </span>
        );
      })}
    </>
  );
}
