import { toast as sonnerToast } from "sonner";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

/**
 * Compatibility layer: the ported screens call `toast({ title, description })`.
 * Software Vala renders notifications with sonner.
 */
export function toast({ title, description, variant }: ToastInput) {
  const message = title ?? description ?? "";
  const options = title && description ? { description } : undefined;

  if (variant === "destructive") return sonnerToast.error(message, options);
  if (variant === "success") return sonnerToast.success(message, options);
  return sonnerToast(message, options);
}

export function useToast() {
  return { toast, dismiss: sonnerToast.dismiss };
}
