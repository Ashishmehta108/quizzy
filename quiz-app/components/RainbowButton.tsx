import { ArrowRight } from "lucide-react";
import { RainbowButton } from "./magicui/rainbow-button";
import { cn } from "@/lib/utils";
import Link from "next/link";
export function CoolButton({
  className = "",
}: {
  className?: string;
  // onClick: () => void
}) {
  return (
    <Link href="/dashboard">
      <RainbowButton
        className={cn(
          " font-semibold  transition-all duration-300 group  gap-2 flex items-center ",
          className
        )}
      >
        {" "}
        Start Creating Now
        <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </RainbowButton>
      
    </Link>
  );
}
