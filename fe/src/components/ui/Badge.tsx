import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "gray" | "green" | "red" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: "bg-[#e1ecf4] text-[#39739d] border-[#9cc3db]",
  gray: "bg-[#e4e6e8] text-[#6a737c] border-[#c8ccd0]",
  green: "bg-[#d4edda] text-[#2e6d44] border-[#9cd4b0]",
  red: "bg-[#fce8e9] text-[#c91d2e] border-[#f5b8bc]",
  yellow: "bg-[#fdf3d0] text-[#a56600] border-[#f5d67d]",
};

export default function Badge({ children, variant = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
