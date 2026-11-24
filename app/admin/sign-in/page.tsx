import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/login";
export const dynamic = "force-dynamic";
export default async function SignInPage() {
  if (await hasAdminSession()) redirect("/admin/");
  return (
    <AdminLogin
      configured={Boolean(
        process.env.ADMIN_PASSWORD_HASH && process.env.DATABASE_URL,
      )}
    />
  );
}
