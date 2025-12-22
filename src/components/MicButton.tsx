import { Mic, Square, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type RecordingState = "idle" | "recording" | "paused";

interface MicButtonProps {
  state: RecordingState;
  onToggleRecording: () => void;
  onPause: () => void;
  onStop: () => void;
}

const MicButton = ({ state, onToggleRecording, onPause, onStop }: MicButtonProps) => {
  const isRecording = state === "recording";
  const isPaused = state === "paused";
  const isActive = isRecording || isPaused;

  return (
    <div className="flex items-center gap-4">
      {/* Pause Button */}
      {isActive && (
        <button
          onClick={onPause}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            "shadow-md hover:shadow-lg active:scale-95"
          )}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      )}

      {/* Main Mic Button */}
      <button
        onClick={isActive ? onStop : onToggleRecording}
        className={cn(
          "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
          "shadow-lg hover:shadow-xl active:scale-95",
          isActive
            ? "bg-destructive text-destructive-foreground shadow-destructive/25 hover:shadow-destructive/30"
            : "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/30 hover:scale-105"
        )}
      >
        {/* Pulse ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring" />
        )}
        
        {isActive ? (
          <Square className="w-7 h-7" fill="currentColor" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      {/* Spacer for symmetry */}
      {isActive && <div className="w-12 h-12" />}
    </div>
  );
};

export default MicButton;
