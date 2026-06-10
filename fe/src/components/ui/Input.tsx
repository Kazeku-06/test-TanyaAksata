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
          <label className="text-sm font-medium text-[#232629]">
            {label}
            {props.required && <span className="text-[#c91d2e] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a737c] group-focus-within:text-[#0a95ff] transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full py-2 text-sm border rounded bg-white text-[#232629] placeholder-[#babfc4] transition-all",
              "border-[#babfc4] hover:border-[#838c95]",
              "focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20",
              "disabled:bg-[#f6f6f6] disabled:cursor-not-allowed",
              leftIcon ? "pl-10 pr-3" : "px-3",
              error && "border-[#c91d2e] focus:border-[#c91d2e] focus:ring-[#c91d2e]/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#c91d2e]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6a737c]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
