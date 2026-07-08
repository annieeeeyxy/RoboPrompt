import type { DisplayMessage } from "@/types/chat";

export function ChatBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-black/5 text-foreground dark:bg-white/10"
        }`}
      >
        {message.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageUrl}
            alt="Uploaded robot arm"
            className="mb-2 max-h-48 rounded-lg object-contain"
          />
        )}
        {message.text}
      </div>
    </div>
  );
}
