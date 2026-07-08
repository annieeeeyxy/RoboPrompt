import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MEMBERS } from "@/content/members";

export function generateStaticParams() {
  return MEMBERS.map((member) => ({ slug: member.slug }));
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = MEMBERS.find((m) => m.slug === slug);
  if (!member) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-16">
      <Link href="/members" className="text-sm text-black/50 hover:text-foreground dark:text-white/50">
        ← Back to Members
      </Link>

      <div className="flex flex-col items-center gap-4 text-center">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white">
            {member.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold">{member.name}</h1>
          <p className="text-sm text-black/50 dark:text-white/50">{member.role}</p>
        </div>
        {member.bio && (
          <p className="max-w-md text-sm text-black/60 dark:text-white/60">{member.bio}</p>
        )}
      </div>

      {(member.github || member.email) && (
        <div className="flex justify-center gap-3">
          {member.github && (
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              GitHub
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              Email
            </a>
          )}
        </div>
      )}

      {member.wechatQr && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
            WeChat
          </p>
          <Image
            src={member.wechatQr}
            alt={`${member.name}'s WeChat QR code`}
            width={200}
            height={200}
            className="rounded-xl border border-black/10 dark:border-white/10"
          />
        </div>
      )}
    </main>
  );
}
