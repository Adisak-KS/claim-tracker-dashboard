import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProvidersView } from "@/features/providers/components/providers-view";

export const metadata = { title: "หน่วยบริการ | ระบบติดตามการส่งเคลม" };

export default function ProvidersPage() {
  return (
    <AppShell title="หน่วยบริการ">
      <Suspense>
        <ProvidersView />
      </Suspense>
    </AppShell>
  );
}
