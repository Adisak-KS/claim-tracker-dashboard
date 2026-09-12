import { AppShell } from "@/components/layout/app-shell";
import { ProviderDetailView } from "@/features/provider-detail/components/provider-detail-view";

export const metadata = { title: "รายละเอียดหน่วยบริการ | ระบบติดตามการส่งเคลม" };

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <AppShell title="รายละเอียดหน่วยบริการ">
      <ProviderDetailView code={code} />
    </AppShell>
  );
}
