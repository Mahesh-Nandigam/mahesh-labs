"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { episodePath, getEpisode } from "@/lib/episodes";

export function LegacyEpisodeLinks() {
  const router = useRouter();
  useEffect(() => {
    function followLink() {
      const match = window.location.hash.match(/^#episode-(\d+)$/);
      if (match && getEpisode(Number(match[1]))) router.replace(episodePath(Number(match[1])));
    }
    followLink();
    window.addEventListener("hashchange", followLink);
    return () => window.removeEventListener("hashchange", followLink);
  }, [router]);
  return null;
}
