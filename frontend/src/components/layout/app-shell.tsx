"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { SessionUser } from "@/lib/auth/roles";

/** ผู้ใช้จำลองระหว่างยังไม่ต่อ BMS Life จริง */
const MOCK_USER: SessionUser = {
  id: "u-001",
  username: "somchai.p",
  displayName: "สมชาย ผู้บริหาร",
  role: "admin",
  department: "ฝ่ายบริหาร",
};

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh items-start bg-background">
      <Sidebar
        user={MOCK_USER}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={MOCK_USER}
          title={title}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        {/* จอใหญ่มากอย่าปล่อยเนื้อหากองกลาง จำกัดที่ 1920 แล้วขยาย spacing แทน */}
        <main className="mx-auto w-full max-w-[1920px] flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
