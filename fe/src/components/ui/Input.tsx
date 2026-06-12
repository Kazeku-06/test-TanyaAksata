import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-semibold text-[#1e293b]">
            {label}
            {props.required && <span className="text-red-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#60a5fa] transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full py-2 text-sm border rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] transition-all",
              "border-blue-200 hover:border-blue-300",
              "focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20",
              "disabled:bg-blue-50/50 disabled:cursor-not-allowed",
              leftIcon ? "pl-10 pr-3" : "px-3",
              error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-[#64748b]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
