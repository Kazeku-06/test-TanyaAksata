import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, { px: number; className: string }> = {
  xs: { px: 16, className: "w-4 h-4 text-[10px]" },
  sm: { px: 24, className: "w-6 h-6 text-xs" },
  md: { px: 32, className: "w-8 h-8 text-sm" },
  lg: { px: 48, className: "w-12 h-12 text-base" },
  xl: { px: 64, className: "w-16 h-16 text-lg" },
};

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({ name, avatar, size = "md", className }: AvatarProps) {
  const { px, className: sizeClass } = sizeMap[size];
  const src = getAvatarUrl(avatar, name);

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden flex-shrink-0 bg-blue-50",
        sizeClass,
        className
      )}
    >
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className="object-cover w-full h-full"
        unoptimized={src.includes("ui-avatars.com")}
      />
    </div>
  );
}
