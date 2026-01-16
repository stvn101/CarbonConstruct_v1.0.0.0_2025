import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";
import { ScrollBar } from "@/components/ui/scroll-area";

type ChainedScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  /**
   * When true, wheel scrolling will "chain" to the window when the scroll area
   * reaches its top/bottom edge.
   *
   * This prevents the page from feeling "stuck" inside nested scroll regions.
   */
  chainToWindow?: boolean;
};

const ChainedScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ChainedScrollAreaProps
>(({ className, children, chainToWindow = true, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!chainToWindow) return;
      const viewport = viewportRef.current;
      if (!viewport) return;

      const deltaY = e.deltaY;
      if (!deltaY) return;

      const atTop = viewport.scrollTop <= 0;
      const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;

      // If the inner scroll region can't scroll further in the wheel direction,
      // let the event bubble naturally - do NOT preventDefault.
      // The browser will handle scroll chaining to the page automatically.
      if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
        // Simply allow the event to propagate - no manual scrollBy needed
        return;
      }
    },
    [chainToWindow]
  );

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        onWheel={handleWheel}
        className="h-full w-full rounded-[inherit]"
        style={{ overscrollBehavior: chainToWindow ? 'auto' : 'contain' }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ChainedScrollArea.displayName = "ChainedScrollArea";

export { ChainedScrollArea };
