import { AppShell } from "@/components/layout/app-shell";
import { AdminView } from "@/features/admin/components/admin-view";

export const metadata = { title: "ตั้งค่าระบบ | ระบบติดตามการส่งเคลม" };

export default function AdminPage() {
  return (
    <AppShell title="ตั้งค่าระบบ">
      <AdminView />
    </AppShell>
  );
}
