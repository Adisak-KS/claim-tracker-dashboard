import { CircleCheck, CircleSlash, Quote, Wrench } from "lucide-react";
import type { AuthorityResponse } from "@/lib/domain/claim";
import { cn } from "@/lib/utils";

/**
 * ข้อความที่หน่วยงานปลายทางตอบกลับมาจริง
 *
 * 🔴 ห้ามแปลหรือเรียบเรียงข้อความนี้ใหม่ ต้องแสดงดิบตามที่ได้รับมา
 * เพราะเจ้าหน้าที่ต้องเอาไปอ้างอิงกับหน่วยบริการและกับ สปสช.
 * ถ้าเราแก้คำ คนสองฝั่งจะคุยกันคนละเรื่อง
 *
 * แสดงคู่กับวิธีแก้ที่หน่วยงานแนะนำ (solution) ซึ่งบางรหัสไม่ส่งมา
 */
export function AuthorityMessage({
  response,
  className,
}: {
  response: AuthorityResponse;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border bg-surface-muted/60 p-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {response.code}
        </code>
        <AllowClaimBadge value={response.allowClaim} />
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground">
        <Quote
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span>{response.message}</span>
      </p>

      {response.solution && (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Wrench className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{response.solution}</span>
        </p>
      )}
    </div>
  );
}

/** ธงนี้ตัดสินว่าเป็นงานที่รอแก้ หรือเงินที่หายไปแล้ว คนละเรื่องกันสิ้นเชิง */
function AllowClaimBadge({ value }: { value: "Y" | "N" | null }) {
  if (value === null) {
    return (
      <span className="text-xs text-muted-foreground">
        ไม่ได้ระบุว่าส่งใหม่ได้หรือไม่
      </span>
    );
  }

  const allowed = value === "Y";
  const Icon = allowed ? CircleCheck : CircleSlash;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        allowed
          ? "border-success-border bg-success-surface text-success"
          : "border-danger-border bg-danger-surface text-danger",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {allowed ? "แก้แล้วส่งใหม่ได้" : "ส่งใหม่ไม่ได้ ต้องอุทธรณ์"}
    </span>
  );
}

/**
 * แบบย่อสำหรับใช้ในตารางที่มีหลายสิบแถว
 *
 * ตารางต้องสแกนเร็ว จึงเหลือบรรทัดเดียว ไม่มีกรอบไม่มีพื้นหลัง
 * ป้าย "แก้แล้วส่งใหม่ได้" ตัดออกเพราะซ้ำเกือบทุกแถวจนตาชิน
 * เหลือเฉพาะกรณีส่งใหม่ไม่ได้ ซึ่งเป็นตัวที่ต้องสังเกตจริง
 *
 * วิธีแก้ไม่แสดงตรงนี้ ให้ชี้เมาส์ดูใน title หรือเปิดรายละเอียดเอา
 */
export function AuthorityMessageInline({
  response,
}: {
  response: AuthorityResponse;
}) {
  const blocked = response.allowClaim === "N";

  return (
    <span className="flex items-start gap-2">
      <code
        className={cn(
          "mt-px shrink-0 rounded px-1.5 py-0.5 font-mono text-xs",
          blocked
            ? "bg-danger-surface text-danger"
            : "bg-surface-muted text-muted-foreground",
        )}
      >
        {response.code}
      </code>

      <span className="min-w-0">
        <span className="line-clamp-2 break-words text-sm text-foreground">
          {response.message}
        </span>
        {blocked && (
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-danger">
            <CircleSlash className="size-3 shrink-0" aria-hidden />
            ส่งใหม่ไม่ได้ ต้องอุทธรณ์
          </span>
        )}
      </span>
    </span>
  );
}
