import { useState, useCallback, useRef } from "react";
import VoiceWaveform from "./VoiceWaveform";
import MicButton from "./MicButton";
import LiveTranscript from "./LiveTranscript";
import ConversationHistory, { ConversationHistoryRef } from "./ConversationHistory";
import { Sparkles } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAIChat } from "@/hooks/useAIChat";
import { useToast } from "@/hooks/use-toast";

type RecordingState = "idle" | "recording" | "paused";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const VoiceChatInterface = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingResponse, setStreamingResponse] = useState("");
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
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

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

  const handleToggleRecording = useCallback(() => {
    if (!speechSupported) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
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
  }, [speechSupported, startListening, resetTranscript, toast]);

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
        const response = await sendMessage(chatHistoryRef.current);
        
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
  }, [liveTranscript, stopListening, sendMessage, speak]);

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
