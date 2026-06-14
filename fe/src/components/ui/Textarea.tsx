import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-semibold text-[#1e293b]">
            {label}
            {props.required && <span className="text-[#dc2626] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] resize-y min-h-[120px]",
            "border-blue-200 hover:border-blue-300",
            "focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20",
            "disabled:bg-blue-50/50 disabled:cursor-not-allowed",
            error && "border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#64748b]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
