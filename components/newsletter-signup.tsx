"use client";
import Image from "next/image";
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
          <Image src="/assets/brand-mark.svg" width={44} height={44} alt="" />
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
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
