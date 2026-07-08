import Image from "next/image";

type Member = {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
};

// Add more entries here if others join the project later.
const MEMBERS: Member[] = [
  {
    name: "Annie Ye",
    role: "Creator & Developer",
    bio: "Building RoboPrompt end to end — product, system prompt design, and the web app.",
    photo: "/annie.png",
  },
  {
    name: "Dora Ai",
    role: "Team Member",
    photo: "/dora.png",
  },
];

function Avatar({ member }: { member: Member }) {
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={member.name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
      {member.name
        .split(" ")
        .map((part) => part[0])
        .join("")}
    </div>
  );
}

export default function MembersPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
      <header>
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          The people behind RoboPrompt.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {MEMBERS.map((member) => (
          <li
            key={member.name}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 p-5 dark:border-white/10"
          >
            <div className="flex items-center gap-3">
              <Avatar member={member} />
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-black/50 dark:text-white/50">{member.role}</p>
              </div>
            </div>
            {member.bio && (
              <p className="text-sm text-black/60 dark:text-white/60">{member.bio}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
