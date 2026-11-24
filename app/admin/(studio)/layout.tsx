import type { ReactNode } from "react";
import { adminDb } from "@/lib/studio-store";
import { AdminShell } from "@/components/admin/shell";
export const dynamic = "force-dynamic";
export default async function StudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  await adminDb();
  return <AdminShell>{children}</AdminShell>;
}
