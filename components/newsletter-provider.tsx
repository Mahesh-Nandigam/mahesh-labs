"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { NewsletterForm } from "./newsletter-form";

const subscribedKey = "maheshlabs-newsletter-subscribed";
const dismissalCountKey = "maheshlabs-newsletter-dismissals";
const maxDismissals = 3;
const NewsletterContext = createContext({
  subscribed: false,
  markSubscribed: () => {},
});
export function useNewsletter() {
  return useContext(NewsletterContext);
}

export function NewsletterProvider({ children }: { children: ReactNode }) {
  const [subscribed, setSubscribed] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const prompted = useRef(false);
  const dismissalCount = useRef(0);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      setSubscribed(localStorage.getItem(subscribedKey) === "1");
      const storedCount = Number(localStorage.getItem(dismissalCountKey));
      if (Number.isFinite(storedCount) && storedCount > 0) {
        dismissalCount.current = Math.min(Math.floor(storedCount), maxDismissals);
      }
    } catch {}
    setReady(true);
  }, []);

  function rememberPrompt() {
    prompted.current = true;
  }
  function handleClose() {
    setOpen(false);
    if (subscribed) return;
    dismissalCount.current = Math.min(dismissalCount.current + 1, maxDismissals);
    try {
      localStorage.setItem(dismissalCountKey, String(dismissalCount.current));
    } catch {}
  }
  function markSubscribed() {
    setSubscribed(true);
    try {
      localStorage.setItem(subscribedKey, "1");
    } catch {}
  }

  useEffect(() => {
    if (!ready || subscribed || open) return;
    if (prompted.current || dismissalCount.current >= maxDismissals) return;
    let timer: ReturnType<typeof setTimeout>;
    const showPrompt = () => {
      // Wait while someone is typing, watching, or using another dialog.
      if (
        document.visibilityState !== "visible" ||
        document.querySelector("dialog[open]") ||
        document.activeElement?.matches("input, textarea, select, [contenteditable='true']") ||
        document.fullscreenElement ||
        Array.from(document.querySelectorAll("video")).some(video => !video.paused)
      ) {
        timer = setTimeout(showPrompt, 5000);
        return;
      }
      rememberPrompt();
      setOpen(true);
    };
    timer = setTimeout(showPrompt, 5000);
    return () => clearTimeout(timer);
  }, [ready, subscribed, open]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      if (element.open) element.close();
      return;
    }
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <NewsletterContext.Provider value={{ subscribed, markSubscribed }}>
      {children}
      {ready && !subscribed && (
        <button
          type="button"
          className="newsletter-float"
          aria-label="Open newsletter signup"
          aria-haspopup="dialog"
          title="Daily news and early podcast access"
          onClick={() => {
            rememberPrompt();
            setOpen(true);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </button>
      )}
      <dialog
        ref={dialog}
        className="newsletter-dialog"
        aria-labelledby="newsletter-popup-title"
        aria-describedby="newsletter-popup-description"
        onCancel={() => setOpen(false)}
        onClose={handleClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="newsletter-popup-card">
          <button
            type="button"
            className="newsletter-popup-close"
            aria-label="Close newsletter signup"
            onClick={() => setOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
          <div className="newsletter-popup-brand">
            <Image src="/assets/brand-mark.svg" width={36} height={36} alt="" />
            <p className="newsletter-popup-name">
              The{" "}
              <Image src="/assets/wordmark.svg" width={144} height={28} alt="Mahesh Labs" />
              {" "}newsletter
            </p>
          </div>
          <h2 id="newsletter-popup-title">Daily news. Early podcast access.</h2>
          <p id="newsletter-popup-description">
            Get daily news and early access to new podcasts, straight to your
            inbox.
          </p>
          <NewsletterForm
            subscribed={subscribed}
            onSubscribed={markSubscribed}
          />
        </div>
      </dialog>
    </NewsletterContext.Provider>
  );
}
