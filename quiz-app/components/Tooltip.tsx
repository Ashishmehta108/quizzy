import { cn } from "@/lib/utils";
export default function Tooltip({
  children,
  hoverText,
  className,
  alignTooltip = "top",
}: {
  children: React.ReactNode;
  hoverText?: string;
  className?: string;
  alignTooltip?: "left" | "right" | "top" | "bottom";
}) {
  return (
    <div className={cn("relative group " , className)}>
      <div
        className={cn(
          `absolute ${alignTooltip!}-10 hidden group-hover:block  left-1/2 -translate-x-1/2 group-hover:bg-zinc-100  text-zinc-900 text-[14px] px-2 py-1.5 rounded z-20`,
          alignTooltip
        )}
      >
        {hoverText}
      </div>
      {children}
    </div>
  );
}
