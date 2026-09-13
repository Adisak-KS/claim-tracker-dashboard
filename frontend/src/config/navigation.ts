import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileBarChart2,
  LayoutDashboard,
  Settings,
  TriangleAlert,
} from "lucide-react";
import type { Role } from "@/lib/auth/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** ว่างไว้ = ทุก role เห็น ใส่ค่า = เห็นเฉพาะ role ที่ระบุ */
  roles?: Role[];
  /** ข้อความสั้นบอกว่าเมนูนี้ใช้ทำอะไร แสดงตอน hover */
  hint?: string;
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

/**
 * เพิ่มเมนูใหม่ = เพิ่ม object ในลิสต์นี้ที่เดียว
 * ไม่ต้องแก้ Sidebar หรือไฟล์อื่น
 *
 * /submissions ถอดออกจากเมนูแล้วแต่ไฟล์ยังอยู่ เข้าตรงด้วย URL ได้
 * เหตุผลและเงื่อนไขที่จะลบจริงอยู่ใน docs/design/decisions.md
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    items: [
      {
        label: "ภาพรวม",
        href: "/",
        icon: LayoutDashboard,
        hint: "สรุปการส่งเคลมทั้งประเทศ",
      },
      {
        label: "หน่วยบริการ",
        href: "/providers",
        icon: Building2,
        hint: "ค้นหาและดูสถานะราย รพ. คลินิก ร้านยา",
      },
      {
        label: "ปัญหา",
        href: "/issues",
        icon: TriangleAlert,
        hint: "จัดอันดับปัญหาและวิธีแก้ไข",
      },
      {
        label: "รายงาน",
        href: "/reports",
        icon: FileBarChart2,
        hint: "สรุปรายวันและรายเดือน",
      },
    ],
  },
  {
    id: "admin",
    title: "ผู้ดูแลระบบ",
    items: [
      {
        label: "ตั้งค่าระบบ",
        href: "/admin",
        icon: Settings,
        roles: ["admin"],
        hint: "ผู้ใช้ สิทธิ์ และการแจ้งเตือน",
      },
    ],
  },
];
