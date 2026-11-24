import { adminDb } from "@/lib/studio-store";
import { NewsletterEditor } from "@/components/admin/newsletter-editor";
export default async function NewNewsletter() {
  await adminDb();
  return (
    <NewsletterEditor
      initial={{
        id: "",
        title: "",
        subject: "",
        preheader: "",
        body: "",
        earlyAccessUrl: "",
        status: "draft",
        updatedAt: "",
      }}
    />
  );
}
