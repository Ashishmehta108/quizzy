import { Safari } from "@/components/magicui/safari";
import Dashboard from "../../public/dashboard.png";
export function SafariDashboard() {
  return (
    <div className="relative container max-w-7xl mx-auto">
      <Safari
        url="quizzy.vercel.app"
        width={1203}
        height={753}
        className="size-full mx-auto hidden lg:block "
        imageSrc={Dashboard.src}
      />
    </div>

  );
}



