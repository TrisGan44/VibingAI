import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import ConversationMessage from "./ConversationMessage";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
}

interface ConversationHistoryProps {
  messages: Message[];
  streamingMessageId?: string | null;
  onCopy?: (message: Message) => void;
  onReplay?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export interface ConversationHistoryRef {
  scrollToBottom: () => void;
}

const ConversationHistory = forwardRef<ConversationHistoryRef, ConversationHistoryProps>(
  ({ messages, streamingMessageId, onCopy, onReplay, onDelete }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    useImperativeHandle(ref, () => ({
      scrollToBottom,
    }));

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    if (messages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Start a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Tap the mic button to begin speaking
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-4 py-4 sm:py-6 space-y-4 max-w-4xl w-full mx-auto"
      >
        {messages.map((message) => (
          <ConversationMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isStreaming={!message.isUser && message.id === streamingMessageId ? true : message.isStreaming}
            onCopy={onCopy ? () => onCopy(message) : undefined}
            onReplay={!message.isUser && onReplay ? () => onReplay(message) : undefined}
            onDelete={onDelete ? () => onDelete(message.id) : undefined}
          />
        ))}
      </div>
    );
  }
);

ConversationHistory.displayName = "ConversationHistory";

export default ConversationHistory;
