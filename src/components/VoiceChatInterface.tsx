import { useState, useCallback, useRef } from "react";
import VoiceWaveform from "./VoiceWaveform";
import MicButton from "./MicButton";
import LiveTranscript from "./LiveTranscript";
import ConversationHistory, { ConversationHistoryRef } from "./ConversationHistory";
import { Sparkles } from "lucide-react";

type RecordingState = "idle" | "recording" | "paused";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

// Dummy responses for simulation
const dummyResponses = [
  "That's a great question! I'd be happy to help you with that.",
  "I understand what you're looking for. Let me explain...",
  "Interesting point! Here's what I think about that.",
  "Thanks for sharing. Based on what you've said, I'd suggest...",
  "That makes sense. Let me provide some context on this topic.",
];

const VoiceChatInterface = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const conversationRef = useRef<ConversationHistoryRef>(null);

  // Simulate transcription while recording
  const simulateTranscription = useCallback(() => {
    const phrases = [
      "Hello, ",
      "Hello, I wanted to ask ",
      "Hello, I wanted to ask about the weather ",
      "Hello, I wanted to ask about the weather today...",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < phrases.length) {
        setLiveTranscript(phrases[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const handleToggleRecording = useCallback(() => {
    setRecordingState("recording");
    setLiveTranscript("");
    simulateTranscription();
    // Scroll to bottom when recording starts
    setTimeout(() => {
      conversationRef.current?.scrollToBottom();
    }, 100);
  }, [simulateTranscription]);

  const handlePause = useCallback(() => {
    setRecordingState((prev) => (prev === "paused" ? "recording" : "paused"));
  }, []);

  const handleStop = useCallback(() => {
    if (liveTranscript) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: liveTranscript,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1500);
    }

    setRecordingState("idle");
    setLiveTranscript("");
  }, [liveTranscript]);

  const isActive = recordingState === "recording" || recordingState === "paused";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Voice AI</h1>
        </div>
      </header>

      {/* Conversation History */}
      <ConversationHistory ref={conversationRef} messages={messages} />

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
          {isActive ? "Tap stop to send message" : "Tap to start speaking"}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatInterface;
