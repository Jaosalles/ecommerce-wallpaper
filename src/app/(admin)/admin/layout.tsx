import {
  AdminLayoutHeader,
  ensureAdminLayoutAccess,
} from "@/components/admin/layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAdminLayoutAccess();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <AdminLayoutHeader />

      {children}
    </main>
  );
}
