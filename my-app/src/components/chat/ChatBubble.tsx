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
        {message.imageUrls && message.imageUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.imageUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt="Uploaded robot arm"
                className="h-24 w-24 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        {message.text}
      </div>
    </div>
  );
}
