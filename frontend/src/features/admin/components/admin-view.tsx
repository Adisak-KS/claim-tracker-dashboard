"use client";

import {
  Bell,
  Database,
  KeyRound,
  Lock,
  Plug,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/shared/states";
import {
  ROLE_LABEL,
  can,
  type Role,
  type SessionUser,
} from "@/lib/auth/roles";
import { formatNumber } from "@/lib/utils";

/** ผู้ใช้จำลองระหว่างยังไม่ต่อ BMS Life จริง ตรงกับที่ app-shell ใช้ */
const MOCK_USER: SessionUser = {
  id: "u-001",
  username: "somchai.p",
  displayName: "สมชาย ผู้บริหาร",
  role: "admin",
  department: "ฝ่ายบริหาร",
};

const USER_COUNT_BY_ROLE: Record<Role, number> = {
  executive: 8,
  manager: 24,
  pm: 12,
  trainer: 17,
  admin: 3,
};

interface HealthItem {
  id: string;
  label: string;
  detail: string;
  tone: "success" | "warning" | "danger";
  status: string;
  icon: LucideIcon;
}

/**
 * สถานะระบบตามที่เจ้าของงานขอไว้: เซิร์ฟเวอร์ล่ม ฐานข้อมูลเต็ม
 * ตอนนี้เป็นค่าจำลอง Phase 2 ค่อยดึงจากระบบเฝ้าระวังจริง
 */
const HEALTH_ITEMS: HealthItem[] = [
  {
    id: "api",
    label: "บริการรับข้อมูล",
    detail: "รับข้อมูลได้ตามปกติ ตอบกลับเฉลี่ย 180 มิลลิวินาที",
    tone: "success",
    status: "ปกติ",
    icon: Plug,
  },
  {
    id: "storage",
    label: "พื้นที่ฐานข้อมูล",
    detail: "ใช้ไปแล้ว 72% ถ้าถึง 85% ระบบจะแจ้งเตือนผู้ดูแลอัตโนมัติ",
    tone: "warning",
    status: "ใกล้เต็ม",
    icon: Database,
  },
  {
    id: "auth",
    label: "การเข้าสู่ระบบ BMS Life",
    detail: "ยังไม่ได้เชื่อมต่อของจริง ตอนนี้ใช้ผู้ใช้จำลอง",
    tone: "warning",
    status: "รอเชื่อมต่อ",
    icon: KeyRound,
  },
];

export function AdminView() {
  const user = MOCK_USER;

  if (!can(user, "admin:manage")) {
    return (
      <div className="space-y-4">
        <PageHeader
          icon={Lock}
          title="ตั้งค่าระบบ"
          description="ส่วนนี้สงวนไว้สำหรับผู้ดูแลระบบ"
        />
        <Card className="animate-rise">
          <EmptyState
            icon={Lock}
            title="บัญชีของคุณไม่มีสิทธิ์เข้าหน้านี้"
            hint="หน้านี้เปิดให้เฉพาะผู้ดูแลระบบ ถ้าคุณต้องใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์"
          />
        </Card>
      </div>
    );
  }

  const totalUsers = Object.values(USER_COUNT_BY_ROLE).reduce(
    (sum, n) => sum + n,
    0,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Settings}
        title="ตั้งค่าระบบ"
        description="ผู้ใช้ สิทธิ์การเข้าถึง และสถานะการทำงานของระบบ"
      />

      <div className="stagger grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            title="ผู้ใช้และสิทธิ์"
            description={`ทั้งหมด ${formatNumber(totalUsers)} บัญชี แบ่งตามบทบาท`}
          />
          <ul className="divide-y divide-border">
            {(Object.keys(USER_COUNT_BY_ROLE) as Role[]).map((role) => (
              <li
                key={role}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface-muted"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm text-foreground">
                    {ROLE_LABEL[role]}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatNumber(USER_COUNT_BY_ROLE[role])} บัญชี
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            การเพิ่มและแก้ไขผู้ใช้จะทำผ่าน BMS Life
            หลังเชื่อมต่อระบบยืนยันตัวตนเรียบร้อยแล้ว
          </p>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="สถานะระบบ"
            description="ตรวจสอบอัตโนมัติทุก 1 นาที แจ้งเตือนผู้ดูแลเมื่อผิดปกติ"
          />
          <ul className="divide-y divide-border">
            {HEALTH_ITEMS.map((item) => (
              <li key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2.5">
                    <item.icon
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                  </span>
                  <StatusBadge tone={item.tone} label={item.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader
            title="การแจ้งเตือน"
            description="กำหนดว่าจะเตือนเมื่อไร และเตือนใคร"
          />
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {[
              {
                label: "อัตราสำเร็จต่ำกว่าเกณฑ์",
                value: "ต่ำกว่า 80%",
                hint: "เตือนทีมฝึกอบรมให้เข้าไปช่วยหน่วยบริการ",
              },
              {
                label: "หน่วยบริการเงียบ",
                value: "ไม่ส่งเกิน 24 ชม.",
                hint: "อาจเป็นสัญญาณว่าระบบต้นทางมีปัญหา",
              },
              {
                label: "พื้นที่ฐานข้อมูล",
                value: "ใช้เกิน 85%",
                hint: "เตือนผู้ดูแลระบบให้ขยายพื้นที่ล่วงหน้า",
              },
            ].map((rule) => (
              <div key={rule.label} className="bg-surface px-4 py-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bell className="size-3.5" aria-hidden />
                  {rule.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {rule.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{rule.hint}</p>
              </div>
            ))}
          </div>
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            เกณฑ์เหล่านี้ยังแก้ไขไม่ได้ในตอนนี้
            เพราะต้องตกลงกับเจ้าของงานก่อนว่าจะใช้ตัวเลขเท่าไร
          </p>
        </Card>
      </div>
    </div>
  );
}
