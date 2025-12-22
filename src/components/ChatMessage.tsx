import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isLatest?: boolean;
}

const ChatMessage = ({ content, isUser, isLatest = false }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        isLatest && "animate-message-in"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl transition-all duration-300",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass rounded-bl-md text-foreground"
        )}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
