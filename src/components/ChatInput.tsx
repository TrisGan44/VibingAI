import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "glass-strong rounded-2xl transition-all duration-300",
          isFocused ? "input-glow-focus" : "input-glow"
        )}
      >
        <div className="flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Send a message..."
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 bg-transparent resize-none px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base max-h-[150px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 flex-shrink-0",
              message.trim() && !disabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Subtle hint */}
      <p className="text-center text-xs text-muted-foreground/50 mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
