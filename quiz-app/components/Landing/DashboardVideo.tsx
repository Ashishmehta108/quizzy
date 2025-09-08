import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import Dashboard from "@/public/dashboard.png";
import DarkDashboard from "../../public/darkdashboard.png";
export function DashboardVideo() {
  return (
    <div className="relative">
      <HeroVideoDialog
        className="block dark:hidden"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/nuARNT42aCA?si=81WMox0kRVZVZ3I6"
        thumbnailSrc={Dashboard.src}
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/nuARNT42aCA?si=81WMox0kRVZVZ3I6"
        thumbnailSrc={DarkDashboard.src}
        thumbnailAlt="Hero Video"
      />

      {/* https://youtu.be/nuARNT42aCA */}
    </div>
  );
}
