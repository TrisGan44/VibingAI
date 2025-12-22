import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  isActive: boolean;
  className?: string;
}

const VoiceWaveform = ({ isActive, className }: VoiceWaveformProps) => {
  const bars = 24;
  
  return (
    <div className={cn("flex items-center justify-center gap-[3px] h-16", className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.05;
        const baseHeight = Math.sin((i / bars) * Math.PI) * 0.7 + 0.3;
        
        return (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-300",
              isActive 
                ? "bg-gradient-to-t from-wave-primary via-wave-secondary to-wave-tertiary" 
                : "bg-muted"
            )}
            style={{
              height: isActive ? `${baseHeight * 100}%` : "20%",
              animation: isActive ? `wave 0.8s ease-in-out infinite` : "none",
              animationDelay: `${delay}s`,
              opacity: isActive ? 1 : 0.4,
            }}
          />
        );
      })}
    </div>
  );
};

export default VoiceWaveform;
