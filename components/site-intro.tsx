"use client";

import Image from "next/image";
import { useLayoutEffect, useState } from "react";

export function SiteIntro() {
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);

  useLayoutEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || window.location.hash) {
      setVisible(false);
      return;
    }

    function finish() {
      setVisible(false);
    }

    setPlaying(true);
    const timer = window.setTimeout(finish, 2500);
    window.addEventListener("pointerdown", finish, { once: true, passive: true });
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("wheel", finish, { once: true, passive: true });
    motion.addEventListener("change", finish, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("wheel", finish);
      motion.removeEventListener("change", finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`site-intro${playing ? " is-playing" : ""}`}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setVisible(false);
      }}
    >
      <noscript><style>{".site-intro { display: none; }"}</style></noscript>
      <div className="site-intro-content">
        <Image src="/assets/logo.svg" width={320} height={72} alt="" priority />
        <div className="site-intro-words">
          <span>Good questions.</span>
          <span>Real journeys.</span>
        </div>
        <div className="site-intro-line"><span /></div>
      </div>
    </div>
  );
}
