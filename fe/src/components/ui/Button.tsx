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
    "bg-[var(--primary)] !text-white hover:bg-[var(--primary-hover)] border border-[var(--primary)] hover:border-[var(--primary-hover)] shadow-sm hover:shadow-md",
  secondary:
    "bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary-light)] border border-[var(--primary-light)] hover:border-[var(--primary)] shadow-sm",
  danger:
    "bg-[var(--danger)] !text-white hover:bg-[#dc2626] border border-[var(--danger)] hover:border-[#dc2626] shadow-sm",
  ghost:
    "bg-transparent text-[var(--primary)] hover:bg-[var(--primary-light)] border border-transparent",
  outline:
    "bg-white text-[var(--text-light)] hover:text-[var(--text-default)] border border-[var(--border)] hover:border-[#94a3b8] shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className,
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
  },
);

Button.displayName = "Button";
export default Button;
