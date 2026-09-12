import { AppShell } from "@/components/layout/app-shell";
import { ReportsView } from "@/features/reports/components/reports-view";

export const metadata = { title: "รายงาน | ระบบติดตามการส่งเคลม" };

export default function ReportsPage() {
  return (
    <AppShell title="รายงาน">
      <ReportsView />
    </AppShell>
  );
}
