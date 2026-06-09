import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#0a95ff] text-white hover:bg-[#0074cc] border border-[#0a95ff] hover:border-[#0074cc]",
  secondary:
    "bg-[#e1ecf4] text-[#0074cc] hover:bg-[#b3d3ea] border border-[#e1ecf4] hover:border-[#b3d3ea]",
  danger:
    "bg-[#c91d2e] text-white hover:bg-[#a41729] border border-[#c91d2e] hover:border-[#a41729]",
  ghost:
    "bg-transparent text-[#0074cc] hover:bg-[#e1ecf4] border border-transparent",
  outline:
    "bg-white text-[#6a737c] hover:text-[#3b4045] border border-[#babfc4] hover:border-[#838c95]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1 text-xs rounded",
  md: "px-2.5 py-1.5 text-sm rounded",
  lg: "px-4 py-2.5 text-base rounded",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors duration-100 disabled:opacity-60 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
