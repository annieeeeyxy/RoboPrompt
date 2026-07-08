import fs from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getDiary(): string {
  const filePath = path.join(process.cwd(), "src/content/diary.md");
  return fs.readFileSync(filePath, "utf-8");
}

export default function DiaryPage() {
  const markdown = getDiary();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16">
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </main>
  );
}
