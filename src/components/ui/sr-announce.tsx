import * as React from "react";

interface SRAnnounceProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
}

/**
 * Screen Reader Announcement component
 * Creates visually hidden live regions for dynamic content announcements
 * 
 * @param politeness - "polite" waits for user idle, "assertive" interrupts immediately
 * @param atomic - true announces entire region, false only announces changed parts
 */
export const SRAnnounce = React.forwardRef<HTMLDivElement, SRAnnounceProps>(
  ({ children, politeness = "polite", atomic = true }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  )
);
SRAnnounce.displayName = "SRAnnounce";

/**
 * Live region for polite announcements (waits for user idle)
 */
export const SRAnnouncePolite = React.forwardRef<HTMLDivElement, Omit<SRAnnounceProps, "politeness">>(
  ({ children, atomic = true }, ref) => (
    <SRAnnounce ref={ref} politeness="polite" atomic={atomic}>
      {children}
    </SRAnnounce>
  )
);
SRAnnouncePolite.displayName = "SRAnnouncePolite";

/**
 * Live region for assertive announcements (interrupts immediately)
 * Use sparingly - only for critical updates like errors
 */
export const SRAnnounceAssertive = React.forwardRef<HTMLDivElement, Omit<SRAnnounceProps, "politeness">>(
  ({ children, atomic = true }, ref) => (
    <SRAnnounce ref={ref} politeness="assertive" atomic={atomic}>
      {children}
    </SRAnnounce>
  )
);
SRAnnounceAssertive.displayName = "SRAnnounceAssertive";

export { SRAnnounce as default };
