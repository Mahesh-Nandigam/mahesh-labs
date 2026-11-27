"use client";

import Image from "next/image";
import { useLayoutEffect, useState } from "react";

const captions = ["We democratize knowledge.", "From the top 0.1%."];

export function SiteIntro() {
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState({ text: "W", index: 0 });

  useLayoutEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || window.location.hash) {
      setVisible(false);
      return;
    }

    let typingTimer: number;
    let captionIndex = 0;
    let characterCount = 1;

    function typeNextCharacter() {
      if (characterCount < captions[captionIndex].length) {
        characterCount += 1;
        setCaption({
          text: captions[captionIndex].slice(0, characterCount),
          index: captionIndex,
        });
        typingTimer = window.setTimeout(typeNextCharacter, 42);
      } else if (captionIndex < captions.length - 1) {
        typingTimer = window.setTimeout(() => {
          captionIndex += 1;
          characterCount = 1;
          setCaption({ text: captions[captionIndex][0], index: captionIndex });
          typingTimer = window.setTimeout(typeNextCharacter, 42);
        }, 550);
      }
    }

    function finish() {
      window.clearTimeout(typingTimer);
      setVisible(false);
    }

    setPlaying(true);
    typingTimer = window.setTimeout(typeNextCharacter, 42);
    const timer = window.setTimeout(finish, 4500);
    window.addEventListener("pointerdown", finish, { once: true, passive: true });
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("wheel", finish, { once: true, passive: true });
    motion.addEventListener("change", finish, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(typingTimer);
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
        <Image
          src="/assets/logo-intro.webp"
          width={320}
          height={72}
          alt=""
          preload
          unoptimized
        />
        <div className={`site-intro-words${caption.index === 1 ? " is-emphasis" : ""}`}>
          <span className="site-intro-measure">{captions[caption.index]}</span>
          <span className="site-intro-caption">{caption.text}<span className="site-intro-cursor" /></span>
        </div>
        <div className="site-intro-line"><span /></div>
      </div>
    </div>
  );
}
