import { AppShell } from "@/components/layout/app-shell";
import { SubmissionsView } from "@/features/submissions/components/submissions-view";

export const metadata = { title: "การส่งเคลม | ระบบติดตามการส่งเคลม" };

export default function SubmissionsPage() {
  return (
    <AppShell title="การส่งเคลม">
      <SubmissionsView />
    </AppShell>
  );
}
