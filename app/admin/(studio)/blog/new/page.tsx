import { adminDb } from "@/lib/studio-store";
import { BlogEditor } from "@/components/admin/blog-editor";
export default async function NewPost() {
  await adminDb();
  return (
    <BlogEditor
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        body: "",
        cover: "",
        author: "MaheshLabs",
        tags: [],
      }}
    />
  );
}
