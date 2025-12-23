import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  isActive: boolean;
  levels?: number[];
  className?: string;
}

const VoiceWaveform = ({ isActive, levels, className }: VoiceWaveformProps) => {
  const bars = levels?.length || 24;
  const hasLevels = !!levels && levels.length > 0;
  
  return (
    <div className={cn("flex items-center justify-center gap-[3px] h-16", className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.05;
        const baseHeight = Math.sin((i / bars) * Math.PI) * 0.7 + 0.3;
        const level = hasLevels ? levels[i] ?? 0 : baseHeight;
        
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
              height: isActive ? `${Math.max(level, 0.08) * 100}%` : "20%",
              animation: isActive && !hasLevels ? `wave 0.8s ease-in-out infinite` : "none",
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
