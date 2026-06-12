import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "gray" | "green" | "red" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: "bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary-light)]",
  gray: "bg-[var(--header)] text-[var(--text-light)] border-[var(--border)]",
  green: "bg-[#d4edda] text-[var(--success)] border-[#9cd4b0]",
  red: "bg-[#fce8e9] text-[var(--danger)] border-[#f5b8bc]",
  yellow: "bg-[#fdf3d0] text-[#855200] border-[#f5d67d]",
};

export default function Badge({
  children,
  variant = "blue",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded border",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
