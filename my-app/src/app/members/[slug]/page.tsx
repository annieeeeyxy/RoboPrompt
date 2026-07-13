import { notFound } from "next/navigation";
import { MEMBERS } from "@/content/members";
import { MemberProfileContent } from "@/components/members/MemberProfileContent";

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

  return <MemberProfileContent member={member} />;
}
