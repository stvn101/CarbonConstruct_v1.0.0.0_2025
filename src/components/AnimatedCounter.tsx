import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const hasAnimated = useRef(false);
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000,
  });

  // Use native IntersectionObserver to avoid forced reflow from framer-motion's useInView
  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Defer animation start to next frame to avoid forced reflow
          requestAnimationFrame(() => {
            setIsInView(true);
          });
          observer.disconnect();
        }
      },
      { rootMargin: "-100px", threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  // Batch DOM writes using requestAnimationFrame
  const updateTextContent = useCallback((text: string) => {
    if (ref.current) {
      ref.current.textContent = text;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      // Use RAF to batch DOM writes and avoid forced reflow
      requestAnimationFrame(() => {
        updateTextContent(`${prefix}${latest.toFixed(decimals)}${suffix}`);
      });
    });

    return unsubscribe;
  }, [springValue, decimals, prefix, suffix, updateTextContent]);

  return (
    <span
      ref={ref}
      className={`${className} will-change-transform`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {prefix}0{suffix}
    </span>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function AnimatedStatCard({
  value,
  label,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon,
  className = "",
  trend,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const hasAnimated = useRef(false);

  // Use native IntersectionObserver to avoid forced reflow
  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Defer to next frame to avoid forced reflow
          requestAnimationFrame(() => {
            setIsInView(true);
          });
          observer.disconnect();
        }
      },
      { rootMargin: "-50px", threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`glass p-4 md:p-6 rounded-xl will-change-transform transition-all duration-500 ease-out hover:scale-[1.02] ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div
            className={`p-2 rounded-lg bg-primary/10 transition-transform duration-500 ease-out ${isInView ? 'scale-100 rotate-0' : 'scale-75 -rotate-[10deg]'}`}
            style={{ transitionDelay: '200ms' }}
          >
            {icon}
          </div>
        )}
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 ${
              trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-red-500/10 text-red-600"
            } ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2.5'}`}
            style={{ transitionDelay: '300ms' }}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-2xl md:text-3xl font-bold text-foreground"
        />
        <p
          className={`text-sm text-muted-foreground transition-opacity duration-300 ${isInView ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '400ms' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
