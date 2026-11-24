import { apiError, endAdminSession, requireAdmin } from "@/lib/admin-auth";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    await endAdminSession();
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
