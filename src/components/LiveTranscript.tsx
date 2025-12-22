import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
  text: string;
  isActive: boolean;
}

const LiveTranscript = ({ text, isActive }: LiveTranscriptProps) => {
  if (!text && !isActive) return null;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="voice-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors duration-300",
            isActive ? "bg-destructive animate-pulse" : "bg-muted-foreground"
          )} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isActive ? "Listening..." : "Transcript"}
          </span>
        </div>
        <p className={cn(
          "transcript-text text-foreground min-h-[3rem]",
          !text && "text-muted-foreground italic"
        )}>
          {text || "Start speaking..."}
        </p>
      </div>
    </div>
  );
};

export default LiveTranscript;
