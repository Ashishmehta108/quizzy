import { ArrowRight } from "lucide-react";
import { RainbowButton } from "./magicui/rainbow-button";
import { cn } from "@/lib/utils";
export function CoolButton({ className = "", onClick }: {
    className?: string;
    onClick: () => void
}) {
    return <RainbowButton className={cn(" font-semibold  transition-all duration-300 group  gap-2 flex items-center ", className)} onClick={onClick}> Start Creating Now
        <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </RainbowButton>;
}
