import { useEffect, useState } from "react";

interface Orb {
  id: number;
  size: number;
  x: number;
  y: number;
  color: string;
  animationClass: string;
  delay: number;
}

const AnimatedBackground = () => {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    const colors = [
      "bg-orb-1",
      "bg-orb-2", 
      "bg-orb-3",
    ];
    
    const animations = [
      "animate-float-slow",
      "animate-float-medium",
      "animate-float-fast",
    ];

    const generatedOrbs: Orb[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: Math.random() * 300 + 200,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[i % colors.length],
      animationClass: animations[i % animations.length],
      delay: i * 2,
    }));

    setOrbs(generatedOrbs);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Animated orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`orb ${orb.color} ${orb.animationClass} animate-pulse-glow`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            animationDelay: `${orb.delay}s`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Subtle noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
};

export default AnimatedBackground;
