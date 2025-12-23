import { useState, useCallback, useRef, useEffect } from "react";
import VoiceWaveform from "./VoiceWaveform";
import MicButton from "./MicButton";
import LiveTranscript from "./LiveTranscript";
import ConversationHistory, { ConversationHistoryRef } from "./ConversationHistory";
import { Sparkles } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAIChat } from "@/hooks/useAIChat";
import { useToast } from "@/hooks/use-toast";
import OpenRouterKeyForm from "./OpenRouterKeyForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";

type RecordingState = "idle" | "recording" | "paused";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const OPENROUTER_STORAGE_KEY = "openrouter_api_key";

const VoiceChatInterface = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [showKeyForm, setShowKeyForm] = useState(true);
  const conversationRef = useRef<ConversationHistoryRef>(null);
  const { toast } = useToast();

  // Chat history for context
  const chatHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

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
      setStreamingResponse((prev) => prev + delta);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: error,
      });
    },
  });

  // Restore stored API key on load
  useEffect(() => {
    const storedKey = localStorage.getItem(OPENROUTER_STORAGE_KEY);
    if (storedKey) {
      setOpenRouterKey(storedKey);
      setShowKeyForm(false);
    }
  }, []);

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
    
    // Scroll to bottom when recording starts
    setTimeout(() => {
      conversationRef.current?.scrollToBottom();
    }, 100);
  }, [speechSupported, startListening, resetTranscript, toast, openRouterKey]);

  const handlePause = useCallback(() => {
    if (recordingState === "paused") {
      setRecordingState("recording");
      startListening();
    } else {
      setRecordingState("paused");
      stopListening();
    }
  }, [recordingState, startListening, stopListening]);

  const handleStop = useCallback(async () => {
    stopListening();
    
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
      chatHistoryRef.current.push({ role: "user", content: userText });
      
      // Add placeholder for AI response
      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          content: "",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      
      setStreamingResponse("");
      
      try {
        const response = await sendMessage(chatHistoryRef.current, openRouterKey);
        
        // Update the AI message with final response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: response } : msg
          )
        );
        
        chatHistoryRef.current.push({ role: "assistant", content: response });
        
        // Speak the response
        speak(response);
      } catch {
        // Error handled by onError callback
        setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
      }
      
      setStreamingResponse("");
    }

    setRecordingState("idle");
    setLiveTranscript("");
  }, [liveTranscript, stopListening, sendMessage, speak, openRouterKey, toast]);

  // Update streaming message in real-time
  const displayMessages = messages.map((msg) => {
    if (!msg.isUser && msg.content === "" && streamingResponse) {
      return { ...msg, content: streamingResponse };
    }
    return msg;
  });

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
        </div>
      </header>

      {/* OpenRouter API Key */}
      <div className="px-6 pt-4">
        <OpenRouterKeyForm
          apiKey={openRouterKey}
          onSave={handleSaveApiKey}
          onClear={handleClearApiKey}
        />
      </div>

      {/* Conversation History */}
      <ConversationHistory ref={conversationRef} messages={displayMessages} />

      {/* Voice Control Area */}
      <div className="flex-shrink-0 pb-safe">
        {/* Waveform Visualization */}
        <div className="px-6 py-4">
          <VoiceWaveform isActive={recordingState === "recording"} />
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
