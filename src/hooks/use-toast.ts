import { toast as sonnerToast } from "sonner";

// Wrapper to provide compatibility with the old toast({ title, description }) API
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    return sonnerToast(options);
  }

  const { title, description, variant, duration } = options;
  const message = title || description || "";
  const toastOptions = {
    description: title ? description : undefined,
    duration,
  };

  if (variant === "destructive") {
    return sonnerToast.error(message, toastOptions);
  }
  
  return sonnerToast(message, toastOptions);
}

// Provide a useToast hook that returns the wrapped toast for components expecting the hook pattern
function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },
    toasts: [], // sonner manages its own toast state
  };
}

export { useToast, toast };
