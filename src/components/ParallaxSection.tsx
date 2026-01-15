import { useRef, ReactNode, useEffect, useState, useCallback } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // -1 to 1, negative = slower, positive = faster
  direction?: "up" | "down";
}

export function ParallaxSection({ 
  children, 
  className = "", 
  speed = 0.5,
  direction = "up" 
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ y: 0, opacity: 1 });
  const rafId = useRef<number>(0);
  const lastScrollY = useRef<number>(0);

  // Throttled scroll handler using RAF to avoid forced reflow
  const handleScroll = useCallback(() => {
    if (rafId.current) return;
    
    rafId.current = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element) {
        rafId.current = 0;
        return;
      }

      // Cache scroll position to minimize layout reads
      const currentScrollY = window.scrollY;
      if (currentScrollY === lastScrollY.current) {
        rafId.current = 0;
        return;
      }
      lastScrollY.current = currentScrollY;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress (0 to 1) based on element position
      const start = rect.top + currentScrollY - windowHeight;
      const end = rect.bottom + currentScrollY;
      const progress = Math.max(0, Math.min(1, (currentScrollY - start) / (end - start)));
      
      // Calculate y transform
      const yRange = direction === "up" 
        ? [100 * speed, -100 * speed] 
        : [-100 * speed, 100 * speed];
      const y = yRange[0] + (yRange[1] - yRange[0]) * progress;
      
      // Calculate opacity
      let opacity = 1;
      if (progress < 0.2) {
        opacity = 0.6 + (progress / 0.2) * 0.4;
      } else if (progress > 0.8) {
        opacity = 1 - ((progress - 0.8) / 0.2) * 0.4;
      }

      setTransform({ y, opacity });
      rafId.current = 0;
    });
  }, [speed, direction]);

  useEffect(() => {
    // Initial calculation
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div 
        className="will-change-transform"
        style={{ 
          transform: `translateY(${transform.y}px)`,
          opacity: transform.opacity,
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
  backgroundSpeed?: number;
  contentSpeed?: number;
}

export function ParallaxBackground({
  children,
  className = "",
  backgroundSpeed = 0.3,
  contentSpeed = 0.1
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transforms, setTransforms] = useState({ 
    backgroundY: 0, 
    contentY: 0, 
    scale: 1 
  });
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafId.current) return;
    
    rafId.current = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element) {
        rafId.current = 0;
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      const start = rect.top + scrollY - windowHeight;
      const end = rect.bottom + scrollY;
      const progress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
      
      const backgroundY = (50 * backgroundSpeed) + ((-100 * backgroundSpeed) * progress);
      const contentY = (30 * contentSpeed) + ((-60 * contentSpeed) * progress);
      const scale = 0.95 + (0.05 * (progress < 0.5 ? progress * 2 : 2 - progress * 2));

      setTransforms({ backgroundY, contentY, scale });
      rafId.current = 0;
    });
  }, [backgroundSpeed, contentSpeed]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0 -z-10 will-change-transform"
        style={{ transform: `translateY(${transforms.backgroundY}px)` }}
      />
      <div 
        className="will-change-transform"
        style={{ 
          transform: `translateY(${transforms.contentY}px) scale(${transforms.scale})` 
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({ src, alt, className = "", speed = 0.3 }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transforms, setTransforms] = useState({ y: 0, scale: 1.1 });
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafId.current) return;
    
    rafId.current = requestAnimationFrame(() => {
      const element = ref.current;
      if (!element) {
        rafId.current = 0;
        return;
      }

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      const start = rect.top + scrollY - windowHeight;
      const end = rect.bottom + scrollY;
      const progress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
      
      const y = (-50 * speed) + (100 * speed * progress);
      const scale = 1.1 - (0.1 * (progress < 0.5 ? progress * 2 : 2 - progress * 2));

      setTransforms({ y, scale });
      rafId.current = 0;
    });
  }, [speed]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover will-change-transform"
        style={{ transform: `translateY(${transforms.y}px) scale(${transforms.scale})` }}
      />
    </div>
  );
}
