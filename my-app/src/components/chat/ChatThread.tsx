import type { DisplayMessage } from "@/types/chat";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { Spinner } from "@/components/ui/Spinner";

export function ChatThread({
  messages,
  streamingText,
  isStreaming,
}: {
  messages: DisplayMessage[];
  streamingText: string;
  isStreaming: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, i) => (
        <ChatBubble key={i} message={message} />
      ))}
      {isStreaming && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl bg-black/5 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap dark:bg-white/10">
            {streamingText || <Spinner />}
          </div>
        </div>
      )}
    </div>
  );
}
