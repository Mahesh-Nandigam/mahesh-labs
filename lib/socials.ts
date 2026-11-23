import { channelUrl } from "./episodes";

export type SocialPlatform = "youtube" | "x" | "linkedin" | "instagram";

interface SocialChannel {
  name: string;
  platform: SocialPlatform;
  category: string;
  description: string;
  url: string;
  action: string;
  relatedLinks?: { name: string; url: string }[];
}

export const socialChannels: SocialChannel[] = [
  {
    name: "YouTube Main",
    platform: "youtube",
    category: "THE FULL CONVERSATION",
    description: "Full episodes, thoughtful questions, and the stories behind the journey.",
    url: channelUrl,
    action: "Watch full episodes",
  },
  {
    name: "YouTube Shorts",
    platform: "youtube",
    category: "A MOMENT OF INSIGHT",
    description: "A fresh perspective or a useful lesson, in a minute or less.",
    url: "https://www.youtube.com/@MaheshNandigamShorts",
    action: "Watch shorts",
  },
  {
    name: "YouTube Clips",
    platform: "youtube",
    category: "WORTH A CLOSER LISTEN",
    description: "Standout moments and focused discussions from our longer conversations.",
    url: "https://www.youtube.com/@MaheshNandigamClips",
    action: "Watch clips",
  },
  {
    name: "X",
    platform: "x",
    category: "BETWEEN EPISODES",
    description: "New episodes, questions we're thinking about, and conversations with you.",
    url: "https://x.com/mahesh_labs",
    action: "Follow MaheshLabs",
    relatedLinks: [
      { name: "Mahesh Moholkar's X", url: "https://x.com/maheshstwt" },
      { name: "Mahesh Nandigam's X", url: "https://x.com/maheshn_dev" },
    ],
  },
  {
    name: "LinkedIn",
    platform: "linkedin",
    category: "IDEAS TO TAKE WITH YOU",
    description: "Lessons, perspectives, and stories to bring into your own work and journey.",
    url: "https://www.linkedin.com/company/mahesh-labs/",
    action: "Follow MaheshLabs",
    relatedLinks: [
      { name: "Mahesh Moholkar's LinkedIn", url: "https://www.linkedin.com/in/mahesh1822/" },
      { name: "Mahesh Nandigam's LinkedIn", url: "https://www.linkedin.com/in/mahesh-nandigam/" },
    ],
  },
  {
    name: "Instagram",
    platform: "instagram",
    category: "BEHIND THE CONVERSATION",
    description: "Episode highlights, new faces, and a look at what we're making next.",
    url: "https://www.instagram.com/mahesh.labs/",
    action: "Follow MaheshLabs",
    relatedLinks: [
      { name: "Mahesh Nandigam's Instagram", url: "https://www.instagram.com/maheshnandigam_/" },
    ],
  },
];
