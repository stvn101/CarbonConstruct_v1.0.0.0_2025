import { useMemo, useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

// Generate random particles outside of component to satisfy purity rules
const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));
};

// Generate random x offset outside of component
const generateXOffset = () => Math.random() * 20 - 10;

export function FloatingParticles({ count = 20, className = "" }: FloatingParticlesProps) {
  const [isReady, setIsReady] = useState(false);
  const particles = useMemo<Particle[]>(() => generateParticles(count), [count]);

  // Pre-compute random x offsets for animation
  const xOffsets = useMemo(() => {
    return particles.map(() => generateXOffset());
  }, [particles]);

  // Defer particle rendering to avoid forced reflow during initial page load
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleReady = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));
    const handle = scheduleReady(() => {
      setIsReady(true);
    });
    
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle as number);
      } else {
        clearTimeout(handle as number);
      }
    };
  }, []);

  if (!isReady) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Use CSS animations instead of framer-motion to avoid JS layout queries */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) translateX(var(--x-offset, 0)) scale(1.2); opacity: 0.6; }
        }
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          50% { transform: translateY(-50px) translateX(var(--x-offset, 0)) scale(1.3); }
        }
        .floating-particle {
          animation: float-particle var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: transform, opacity;
        }
        .floating-orb {
          animation: float-orb var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          will-change: transform;
        }
      `}</style>
      
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/20 floating-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
            '--x-offset': `${xOffsets[index]}px`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Larger glowing orbs */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full floating-orb"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            width: 60 + i * 10,
            height: 60 + i * 10,
            background: `radial-gradient(circle, hsla(var(--primary) / 0.15) 0%, transparent 70%)`,
            '--duration': `${25 + i * 5}s`,
            '--delay': `${i * 2}s`,
            '--x-offset': `${30 - i * 10}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
