import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
};

const sizeClasses = {
  sm: "h-12 w-28",
  md: "h-14 w-36",
  lg: "h-72 w-full",
};

export function BrandLogo({
  className,
  imageClassName,
  priority = false,
  size = "md",
  tone = "light",
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        sizeClasses[size],
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="AlloDoc"
        width={704}
        height={384}
        priority={priority}
        className={cn("h-full w-full object-contain p-1.5", imageClassName)}
      />
    </span>
  );
}
