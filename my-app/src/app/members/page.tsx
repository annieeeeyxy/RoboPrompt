"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { MEMBERS, type Member } from "@/content/members";

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
  const { t } = useTranslation();

  const getMemberRole = (slug: string, role: string) => {
    const key = `member_${slug.replaceAll("-", "_")}_role`;
    const translated = t(key);
    return translated === key ? role : translated;
  };

  const getMemberBio = (slug: string, bio?: string) => {
    if (!bio) return bio;
    const key = `member_${slug.replaceAll("-", "_")}_bio`;
    const translated = t(key);
    return translated === key ? bio : translated;
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
      <header>
        <h1 className="text-2xl font-semibold">{t("membersTitle")}</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {t("thePeopleBehind")}
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {MEMBERS.map((member) => (
          <li key={member.slug}>
            <Link
              href={`/members/${member.slug}`}
              className="flex h-full flex-col gap-3 rounded-2xl border border-black/10 p-5 transition-colors hover:border-black/25 dark:border-white/10 dark:hover:border-white/25"
            >
              <div className="flex items-center gap-3">
                <Avatar member={member} />
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    {getMemberRole(member.slug, member.role)}
                  </p>
                </div>
              </div>
              {member.bio && (
                <p className="text-sm text-black/60 dark:text-white/60">
                  {getMemberBio(member.slug, member.bio)}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
