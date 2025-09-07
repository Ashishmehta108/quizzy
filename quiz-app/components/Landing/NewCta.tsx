
import { FlickeringGrid } from "../magicui/flickering-grid";

export function GradientCTA() {
  return (
    <div className="relative h-[300px] w-full rounded-lg overflow-hidden  bg-background p-6">
      <FlickeringGrid
        className="absolute w-full inset-0 h-full z-0"
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
    </div>
  );
}
