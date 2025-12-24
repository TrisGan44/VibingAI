import { useState, useCallback, useRef, useEffect } from "react";
import VoiceWaveform from "./VoiceWaveform";
import MicButton from "./MicButton";
import LiveTranscript from "./LiveTranscript";
import ConversationHistory, { ConversationHistoryRef } from "./ConversationHistory";
import { KeyRound, Sparkles } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAIChat } from "@/hooks/useAIChat";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import { useToast } from "@/hooks/use-toast";
import OpenRouterKeyForm from "./OpenRouterKeyForm";
import { Button } from "./ui/button";

type RecordingState = "idle" | "recording" | "paused";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatHistoryEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const OPENROUTER_STORAGE_KEY = "openrouter_api_key";

const VoiceChatInterface = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [showKeyForm, setShowKeyForm] = useState(true);
  const conversationRef = useRef<ConversationHistoryRef>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Chat history for context
  const chatHistoryRef = useRef<ChatHistoryEntry[]>([]);

  // Speech recognition
  const { 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported: speechSupported,
    error: speechError 
  } = useSpeechRecognition({
    onTranscript: (text) => setLiveTranscript(text),
  });

  // Text to speech
  const { speak, isSpeaking } = useTextToSpeech();

  // AI chat
  const { sendMessage, isLoading } = useAIChat({
    onDelta: (delta) => {
      const activeMessageId = streamingMessageIdRef.current;

      if (activeMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === activeMessageId
              ? { ...msg, content: msg.content + delta, isStreaming: true }
              : msg
          )
        );
      }
    },
    onComplete: (fullResponse) => {
      const activeMessageId = streamingMessageIdRef.current;

      if (activeMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === activeMessageId
              ? { ...msg, content: fullResponse, isStreaming: false }
              : msg
          )
        );
      }

      setStreamingMessageId(null);
      streamingMessageIdRef.current = null;
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: error,
      });
    },
  });

  // Audio visualizer
  const {
    levels: audioLevels,
    start: startVisualizer,
    stop: stopVisualizer,
    isActive: visualizerActive,
    error: audioError,
  } = useAudioVisualizer({ bars: 24 });

  // Restore stored API key on load
  useEffect(() => {
    const storedKey = localStorage.getItem(OPENROUTER_STORAGE_KEY);
    if (storedKey) {
      setOpenRouterKey(storedKey);
      setShowKeyForm(false);
    }
  }, []);

  useEffect(() => {
    if (!audioError) return;
    toast({
      variant: "destructive",
      title: "Microphone error",
      description: audioError,
    });
  }, [audioError, toast]);

  const handleSaveApiKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    setOpenRouterKey(trimmedKey);

    if (trimmedKey) {
      localStorage.setItem(OPENROUTER_STORAGE_KEY, trimmedKey);
      setShowKeyForm(false);
      toast({
        title: "OpenRouter key saved",
        description: "You're ready to start chatting.",
      });
    } else {
      localStorage.removeItem(OPENROUTER_STORAGE_KEY);
      toast({
        title: "OpenRouter key cleared",
        description: "Add a key to use the voice assistant.",
      });
    }
  }, [toast]);

  const handleClearApiKey = useCallback(() => {
    setOpenRouterKey("");
    localStorage.removeItem(OPENROUTER_STORAGE_KEY);
    setShowKeyForm(true);
    toast({
      title: "OpenRouter key cleared",
      description: "Add a key to use the voice assistant.",
    });
  }, [toast]);

  const handleToggleRecording = useCallback(() => {
    if (!speechSupported) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
      });
      return;
    }

    if (!openRouterKey) {
      toast({
        variant: "destructive",
        title: "Add OpenRouter API key",
        description: "Enter your key above to enable the voice assistant.",
      });
      return;
    }

    setRecordingState("recording");
    setLiveTranscript("");
    resetTranscript();
    startListening();
    void startVisualizer();
    
    // Scroll to bottom when recording starts
    setTimeout(() => {
      conversationRef.current?.scrollToBottom();
    }, 100);
  }, [speechSupported, startListening, resetTranscript, toast, openRouterKey]);

  const handlePause = useCallback(() => {
    if (recordingState === "paused") {
      setRecordingState("recording");
      startListening();
      void startVisualizer();
    } else {
      setRecordingState("paused");
      stopListening();
      stopVisualizer();
    }
  }, [recordingState, startListening, stopListening, startVisualizer, stopVisualizer]);

  const handleStop = useCallback(async () => {
    stopListening();
    stopVisualizer();
    
    const userText = liveTranscript.trim();
    
    if (userText) {
      if (!openRouterKey) {
        toast({
          variant: "destructive",
          title: "Add OpenRouter API key",
          description: "Enter your key above to send the message.",
        });
        setRecordingState("idle");
        setLiveTranscript("");
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        content: userText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMessage]);
      chatHistoryRef.current.push({ id: userMessage.id, role: "user", content: userText });
      
      // Add placeholder for AI response
      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          content: "",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isStreaming: true,
        },
      ]);
      setStreamingMessageId(aiMessageId);
      streamingMessageIdRef.current = aiMessageId;

      try {
        const response = await sendMessage(
          chatHistoryRef.current.map(({ role, content }) => ({ role, content })),
          openRouterKey
        );

        // Update the AI message with final response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: response, isStreaming: false } : msg
          )
        );

        chatHistoryRef.current.push({ id: aiMessageId, role: "assistant", content: response });

        // Speak the response
        speak(response);
      } catch {
        // Error handled by onError callback
        setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
        setStreamingMessageId(null);
        streamingMessageIdRef.current = null;
      }

      setStreamingMessageId(null);
      streamingMessageIdRef.current = null;
    }

    setRecordingState("idle");
    setLiveTranscript("");
  }, [liveTranscript, stopListening, stopVisualizer, sendMessage, speak, openRouterKey, toast]);

  const handleCopyMessage = useCallback(
    async (message: Message) => {
      try {
        await navigator.clipboard.writeText(message.content);
        toast({ title: "Copied", description: "Message copied to clipboard." });
      } catch {
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Unable to copy message. Check clipboard permissions.",
        });
      }
    },
    [toast]
  );

  const handleReplayMessage = useCallback(
    (message: Message) => {
      if (!message.content) return;
      speak(message.content);
    },
    [speak]
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    chatHistoryRef.current = chatHistoryRef.current.filter((entry) => entry.id !== messageId);

    if (streamingMessageIdRef.current === messageId) {
      setStreamingMessageId(null);
      streamingMessageIdRef.current = null;
    }
  }, []);

  const isActive = recordingState === "recording" || recordingState === "paused";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Voice AI</h1>
          {isSpeaking && (
            <span className="text-xs text-muted-foreground animate-pulse">Speaking...</span>
          )}
          {!showKeyForm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyForm(true)}
              aria-label="Edit OpenRouter API key"
              title="Edit OpenRouter API key"
            >
              <KeyRound className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      {/* OpenRouter API Key */}
      {showKeyForm && (
        <div className="px-6 pt-4">
          <OpenRouterKeyForm
            apiKey={openRouterKey}
            onSave={handleSaveApiKey}
            onClear={handleClearApiKey}
          />
        </div>
      )}

      {/* Conversation History */}
      <ConversationHistory
        ref={conversationRef}
        messages={messages}
        onCopy={handleCopyMessage}
        onReplay={handleReplayMessage}
        onDelete={handleDeleteMessage}
        streamingMessageId={streamingMessageId}
      />

      {/* Voice Control Area */}
      <div className="flex-shrink-0 pb-safe">
        {/* Waveform Visualization */}
        <div className="px-6 py-4">
          <VoiceWaveform
            isActive={recordingState === "recording"}
            levels={visualizerActive ? audioLevels : undefined}
          />
        </div>

        {/* Live Transcript */}
        {isActive && (
          <div className="pb-4">
            <LiveTranscript text={liveTranscript} isActive={recordingState === "recording"} />
          </div>
        )}

        {/* Mic Controls */}
        <div className="flex justify-center pb-8 pt-2">
          <MicButton
            state={recordingState}
            onToggleRecording={handleToggleRecording}
            onPause={handlePause}
            onStop={handleStop}
          />
        </div>

        {/* Hint Text */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          {isLoading 
            ? "AI is thinking..." 
            : isActive 
              ? "Tap stop to send message" 
              : "Tap to start speaking"}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatInterface;
