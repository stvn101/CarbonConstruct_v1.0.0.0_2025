import { motion } from "framer-motion";
import { useMemo } from "react";

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
  const particles = useMemo<Particle[]>(() => generateParticles(count), [count]);

  // Pre-compute random x offsets for animation
  const xOffsets = useMemo(() => {
    return particles.map(() => generateXOffset());
  }, [particles]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, xOffsets[index], 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Larger glowing orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            width: 60 + i * 10,
            height: 60 + i * 10,
            background: `radial-gradient(circle, hsla(var(--primary) / 0.15) 0%, transparent 70%)`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, 30 - i * 10, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25 + i * 5,
            delay: i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
