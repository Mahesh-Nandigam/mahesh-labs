import { apiError, requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
const cell = (value: string) =>
  '"' +
  (/^[=+@\-\t\r\n]/.test(value) ? "'" + value : value).replaceAll('"', '""') +
  '"';
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const status =
      new URL(request.url).searchParams.get("status") === "unsubscribed"
        ? "unsubscribed"
        : "subscribed";
    const result = await db().query(
      "SELECT email,status,source,subscribed_at,unsubscribed_at,consent_text FROM newsletter_subscribers WHERE status=$1 ORDER BY subscribed_at DESC",
      [status],
    );
    const lines = [
      [
        "email",
        "status",
        "source",
        "subscribed_at",
        "unsubscribed_at",
        "consent_text",
      ],
      ...result.rows.map((row) => [
        row.email,
        row.status,
        row.source,
        new Date(row.subscribed_at).toISOString(),
        row.unsubscribed_at ? new Date(row.unsubscribed_at).toISOString() : "",
        row.consent_text,
      ]),
    ];
    return new Response(
      lines.map((row) => row.map(cell).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="maheshlabs-${status}.csv"`,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
