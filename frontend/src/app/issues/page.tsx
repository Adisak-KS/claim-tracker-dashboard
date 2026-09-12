import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { IssuesView } from "@/features/issues/components/issues-view";

export const metadata = { title: "ปัญหาที่พบ | ระบบติดตามการส่งเคลม" };

export default function IssuesPage() {
  return (
    <AppShell title="ปัญหาที่พบ">
      <Suspense>
        <IssuesView />
      </Suspense>
    </AppShell>
  );
}
