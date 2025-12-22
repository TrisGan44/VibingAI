import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ConversationMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

const ConversationMessage = ({ content, isUser, timestamp }: ConversationMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div className={cn("max-w-[75%]", isUser ? "text-right" : "text-left")}>
        <div className={isUser ? "message-user" : "message-ai"}>
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 block px-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConversationMessage;
