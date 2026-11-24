"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NewsletterForm } from "./newsletter-form";

const subscribedKey = "maheshlabs-newsletter-subscribed";
const promptedKey = "maheshlabs-newsletter-prompted";
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
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      setSubscribed(localStorage.getItem(subscribedKey) === "1");
    } catch {}
    try {
      prompted.current = sessionStorage.getItem(promptedKey) === "1";
    } catch {}
    setReady(true);
  }, []);

  function rememberPrompt() {
    prompted.current = true;
    try {
      sessionStorage.setItem(promptedKey, "1");
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
    const started = Date.now();
    const onExit = (event: MouseEvent) => {
      if (
        event.relatedTarget !== null ||
        event.clientY > 0 ||
        event.buttons !== 0 ||
        Date.now() - started < 10000 ||
        prompted.current ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        document.visibilityState !== "visible" ||
        document.querySelector("dialog[open]")
      )
        return;
      rememberPrompt();
      setOpen(true);
    };
    document.addEventListener("mouseout", onExit);
    return () => document.removeEventListener("mouseout", onExit);
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
          title="Get early access to new podcasts"
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
        onClose={() => setOpen(false)}
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
          <p className="eyebrow">THE MAHESHLABS NEWSLETTER</p>
          <h2 id="newsletter-popup-title">Get early access to new podcasts.</h2>
          <p id="newsletter-popup-description">
            Join the newsletter for early access to new conversations, straight
            to your inbox.
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
