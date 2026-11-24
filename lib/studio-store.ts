import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { hasAdminSession } from "./admin-auth";
import { db } from "./db";
export const adminDb = cache(async () => {
  if (!(await hasAdminSession())) redirect("/admin/sign-in/");
  return db();
});
export function pageNumber(
  value: string | undefined,
  total: number,
  size = 50,
) {
  const n = Number(value);
  return Math.min(
    Math.max(1, Math.ceil(total / size)),
    Number.isSafeInteger(n) && n > 0 ? n : 1,
  );
}
export const dateLabel = (date: Date | string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
