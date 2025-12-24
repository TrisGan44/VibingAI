import { cn } from "@/lib/utils";
import { User, Bot, Copy, Trash2, Volume2 } from "lucide-react";

interface ConversationMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean;
  onCopy?: () => void;
  onReplay?: () => void;
  onDelete?: () => void;
}

const TypingIndicator = () => (
  <div className="typing-dots" aria-label="Assistant is responding">
    <span />
    <span />
    <span />
  </div>
);

const ConversationMessage = ({
  content,
  isUser,
  timestamp,
  isStreaming,
  onCopy,
  onReplay,
  onDelete,
}: ConversationMessageProps) => {
  const showActions = onCopy || onReplay || onDelete;

  return (
    <div
      className={cn(
        "group flex gap-3 items-start animate-fade-in-up",
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

      {/* Message bubble and actions */}
      <div className={cn("max-w-[90%] sm:max-w-[75%] flex flex-col", isUser ? "items-end text-right" : "items-start text-left")}>
        <div className={cn("flex items-start gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
          <div className={isUser ? "message-user" : "message-ai"} aria-live={isStreaming ? "polite" : undefined}>
            {content ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
            ) : (
              !isUser && isStreaming && <TypingIndicator />
            )}
            {!isUser && isStreaming && content && (
              <div className="mt-2">
                <TypingIndicator />
              </div>
            )}
          </div>

          {showActions && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1 sm:mt-0",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity"
              )}
            >
              {onReplay && (
                <button
                  type="button"
                  className="message-action"
                  onClick={onReplay}
                  aria-label="Replay message with text-to-speech"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
              {onCopy && (
                <button
                  type="button"
                  className="message-action"
                  onClick={onCopy}
                  aria-label="Copy message"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="message-action"
                  onClick={onDelete}
                  aria-label="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
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
