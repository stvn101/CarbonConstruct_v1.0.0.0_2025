import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Fade out
    setIsVisible(false);
    
    // After fade out, update children and fade in
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timeout);
  }, [location.pathname, children]);

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      )}
    >
      {displayChildren}
    </div>
  );
}
