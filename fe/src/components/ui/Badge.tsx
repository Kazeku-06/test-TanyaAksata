import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "gray" | "green" | "red" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: "bg-blue-50 text-[#60a5fa] border-blue-200",
  gray: "bg-slate-50 text-[#475569] border-slate-200",
  green: "bg-emerald-50 text-[#059669] border-emerald-200",
  red: "bg-red-50 text-red-600 border-red-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Badge({ children, variant = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
