import { z } from "zod";
import { chapterSeconds } from "./chapters";
export const consentText =
  "Subscribed to MaheshLabs newsletters and early-access podcast updates using the newsletter signup form.";
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
const safeUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};
const mediaUrl = z
  .string()
  .max(2048)
  .refine(
    (v) => /^\/(?!\/)/.test(v) || safeUrl(v),
    "Use a site asset path or an http(s) URL.",
  );
export const episodeSchema = z.object({
  number: z.number().int().positive().max(100000),
  guest: z.string().trim().min(1).max(150),
  title: z.string().trim().min(1).max(250),
  description: z.string().trim().min(1).max(10000),
  topics: z.array(z.string().trim().min(1).max(60)).max(12),
  role: z.string().trim().max(250),
  image: mediaUrl,
  videoId: z
    .string()
    .regex(/^[\w-]{11}$/)
    .nullable(),
  duration: z.string().trim().max(50),
  status: z.string().max(60),
  publicReleaseAt: z.iso.datetime({ offset: true }).optional(),
  externalPlayback: z.boolean().optional(),
  teaser: mediaUrl.optional(),
  teaserDuration: z.number().int().positive().max(3600).optional(),
  chapters: z
    .array(
      z
        .object({
          time: z.string().regex(/^(?:\d+:)?\d{1,2}:\d{2}$/),
          seconds: z.number().int().nonnegative(),
          title: z.string().trim().min(1).max(300),
        })
        .refine(
          (chapter) => chapterSeconds(chapter.time) === chapter.seconds,
          "Chapter timestamps and seconds must match.",
        ),
    )
    .max(300)
    .refine(
      (items) =>
        items.every((c, i) => i === 0 || c.seconds > items[i - 1].seconds),
      "Chapter timestamps must increase.",
    ),
  links: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        url: z.string().max(2048).refine(safeUrl, "Use an http(s) URL."),
      }),
    )
    .max(15),
}).refine((episode) => !episode.publicReleaseAt || Boolean(episode.videoId), {
  message: "Add the full YouTube video ID before scheduling early access.",
  path: ["publicReleaseAt"],
});
export const draftSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().max(200),
  preheader: z.string().trim().max(250),
  body: z.string().max(40000),
  earlyAccessUrl: z
    .string()
    .trim()
    .max(2048)
    .refine((v) => !v || safeUrl(v), "Use an http(s) URL."),
  status: z.enum(["draft", "archived"]),
  earlyAccessEpisode: z.number().int().positive().nullable().default(null),
}).refine((draft) => !draft.earlyAccessEpisode || !draft.earlyAccessUrl, "Choose an episode or a custom watch link, rather than both.");
export type NewsletterDraft = z.infer<typeof draftSchema> & {
  id: string;
  updatedAt: string;
};
export async function readJson(request: Request) {
  const body = await request.text();
  if (body.length > 150000) throw new RangeError("Request too large");
  return JSON.parse(body);
}
