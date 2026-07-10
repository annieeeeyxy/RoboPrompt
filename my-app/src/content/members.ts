export type Member = {
  slug: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  github?: string;
  email?: string;
  wechatQr?: string;
};

// Add more entries here if others join the project later.
export const MEMBERS: Member[] = [
  {
    slug: "annie-ye",
    name: "Annie Ye",
    role: "Creator & Developer",
    bio: "Building RoboPrompt end to end — product, system prompt design, and the web app.",
    photo: "/annie.png",
    github: "annieeeeyxy",
    email: "anniexye08@gmail.com",
  },
  {
    slug: "dora-ai",
    name: "Dora Ai",
    role: "Team Member",
    bio: "A high school student and a huge gamer who loves combining creativity with technology.",
    photo: "/dora.png",
  },
];
