"use client";
import { NewsletterForm } from "./newsletter-form";
import { useNewsletter } from "./newsletter-provider";

export function NewsletterSignup({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { subscribed, markSubscribed } = useNewsletter();
  return (
    <section id="newsletter" className="newsletter-section">
      <div className="wrap newsletter-layout">
        <div className="newsletter-copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <NewsletterForm
          compact
          subscribed={subscribed}
          onSubscribed={markSubscribed}
        />
      </div>
    </section>
  );
}
