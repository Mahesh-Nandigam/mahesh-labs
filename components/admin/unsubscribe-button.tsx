"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { studioRequest } from "./client";
export function UnsubscribeButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <button
        className="studio-table-action"
        disabled={busy}
        onClick={async () => {
          if (
            !window.confirm(
              "Remove this subscriber from the mailing list? Their consent history will be retained.",
            )
          )
            return;
          setBusy(true);
          try {
            await studioRequest(`/api/admin/subscribers/${id}/`, "DELETE");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "Updating…" : "Unsubscribe"}
      </button>
      <span className="studio-inline-error" role="status">
        {error}
      </span>
    </>
  );
}
