import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-[#232629]">
            {label}
            {props.required && <span className="text-[#c91d2e] ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded bg-white text-[#232629] placeholder-[#babfc4]",
            "border-[#babfc4] hover:border-[#838c95]",
            "focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20",
            "disabled:bg-[#f6f6f6] disabled:cursor-not-allowed",
            error && "border-[#c91d2e] focus:border-[#c91d2e] focus:ring-[#c91d2e]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#c91d2e]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6a737c]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
