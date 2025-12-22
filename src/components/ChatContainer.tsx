import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { Sparkles } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const responses = [
        "That's an interesting thought! I'd love to explore that further with you.",
        "I understand what you're saying. Let me help you with that.",
        "Great question! Here's what I think about that...",
        "I'm here to help. Could you tell me more about what you're looking for?",
        "That's a fascinating perspective. Have you considered looking at it from this angle?",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: randomResponse,
          isUser: false,
        },
      ]);
    }, 1500 + Math.random() * 1000);
  };

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    simulateResponse(content);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-center py-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-primary" />
            <div className="absolute inset-0 blur-lg bg-primary/30 animate-breathe" />
          </div>
          <h1 className="text-xl font-medium text-foreground tracking-tight">
            Assistant
          </h1>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-breathe" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">
              How can I help you today?
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start a conversation and I'll do my best to assist you.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                isLatest={index === messages.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 pt-2">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatContainer;
