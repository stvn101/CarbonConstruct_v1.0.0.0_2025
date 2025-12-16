import { useEffect, useRef, useState } from "react";

interface UseInViewAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useInViewAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = "50px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isInView };
}

// Hook for staggered animations on multiple children
export function useStaggeredAnimation(baseDelay = 100) {
  const { ref, isInView } = useInViewAnimation<HTMLDivElement>();
  
  const getStaggerDelay = (index: number) => ({
    animationDelay: `${index * baseDelay}ms`,
    opacity: isInView ? 1 : 0,
  });

  return { ref, isInView, getStaggerDelay };
}
