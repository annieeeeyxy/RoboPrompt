"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import type { Member } from "@/content/members";

export function MemberProfileContent({ member }: { member: Member }) {
  const { t } = useTranslation();

  const roleKey = `member_${member.slug.replaceAll("-", "_")}_role`;
  const bioKey = `member_${member.slug.replaceAll("-", "_")}_bio`;
  const translatedRole = t(roleKey);
  const translatedBio = t(bioKey);
  const role = translatedRole === roleKey ? member.role : translatedRole;
  const bio = member.bio
    ? translatedBio === bioKey
      ? member.bio
      : translatedBio
    : undefined;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-16">
      <Link href="/members" className="text-sm text-black/50 hover:text-foreground dark:text-white/50">
        {`\u2190 ${t("backToMembers")}`}
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
          <p className="text-sm text-black/50 dark:text-white/50">{role}</p>
        </div>
        {bio && (
          <p className="max-w-md text-sm text-black/60 dark:text-white/60">{bio}</p>
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
              {t("github")}
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              {t("email")}
            </a>
          )}
        </div>
      )}

      {member.wechatQr && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
            {t("wechat")}
          </p>
          <Image
            src={member.wechatQr}
            alt={`${member.name} ${t("wechat")}`}
            width={200}
            height={200}
            className="rounded-xl border border-black/10 dark:border-white/10"
          />
        </div>
      )}
    </main>
  );
}