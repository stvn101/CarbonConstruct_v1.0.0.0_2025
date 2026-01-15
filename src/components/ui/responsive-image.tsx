import { ImgHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Base image source (largest size) */
  src: string;
  /** Alternative sources for different sizes: { "32w": "/logo-32.webp", "56w": "/logo-56.webp" } */
  sources?: Record<string, string>;
  /** Sizes attribute for responsive loading */
  sizes?: string;
  /** Explicit width for layout stability */
  width?: number | string;
  /** Explicit height for layout stability */
  height?: number | string;
  /** Loading strategy */
  loading?: "lazy" | "eager";
  /** Decoding strategy */
  decoding?: "async" | "sync" | "auto";
  /** Fetch priority */
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * Responsive image component with srcset support.
 * Serves appropriately sized images to reduce bandwidth and improve LCP.
 */
export const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(
  ({ 
    src, 
    sources, 
    sizes = "100vw", 
    width, 
    height, 
    loading = "lazy",
    decoding = "async",
    fetchPriority = "auto",
    className,
    alt = "",
    ...props 
  }, ref) => {
    // Build srcset from sources
    const srcset = sources 
      ? Object.entries(sources)
          .map(([descriptor, url]) => `${url} ${descriptor}`)
          .join(", ")
      : undefined;

    return (
      <img
        ref={ref}
        src={src}
        srcSet={srcset}
        sizes={srcset ? sizes : undefined}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        alt={alt}
        className={cn(className)}
        {...props}
      />
    );
  }
);

ResponsiveImage.displayName = "ResponsiveImage";
