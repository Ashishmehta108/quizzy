import {
  Brain,
  Mail,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import { AnimatedElement } from "@/app/page";
import Image from "next/image";
import Logo from "../public/quizzy_logo.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800  py-20 px-4 mx-3 mt-10 mb-5 sm:px-6 lg:px-8 rounded-3xl transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <AnimatedElement delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-1 mb-5">
                <div className="relative">
                  <div className="absolute top-[20px] left-[22px] h-[25px] w-[25px] bg-white z-0"></div>
                  <Image
                    src={Logo}
                    height={70}
                    width={70}
                    alt="logo"
                    className="relative z-10"
                  />
                </div>
                <span className="text-2xl font-bold text-white ">QuizAI</span>
              </div>
              <p className="text-zinc-300  text-sm leading-relaxed mb-6">
                Revolutionizing learning through AI-powered quizzes. Create,
                learn, and excel with personalized educational experiences.
              </p>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {[
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Github, href: "#", label: "GitHub" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                ].map(({ icon: Icon, href, label }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/5 dark:bg-black/5 hover:bg-white/10  text-zinc-400 hover:text-white  transition-all duration-200"
                    asChild
                  >
                    <a href={href} aria-label={label}>
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white  mb-6">
                Product
              </h3>
              <nav className="space-y-3">
                {[
                  { name: "Features", href: "#" },
                  { name: "Pricing", href: "#" },
                  { name: "Templates", href: "#" },
                  { name: "Integrations", href: "#" },
                  { name: "API Docs", href: "#" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-zinc-300  hover:text-blue-400  transition-colors text-sm font-medium group"
                  >
                    <span className="flex items-center">
                      {item.name}
                      <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white  mb-6">
                Support
              </h3>
              <nav className="space-y-3">
                {[
                  { name: "Help Center", href: "#" },
                  { name: "Contact Us", href: "#" },
                  { name: "Community", href: "#" },
                  { name: "System Status", href: "#" },
                  { name: "Bug Reports", href: "#" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-zinc-300  hover:text-blue-400  transition-colors text-sm font-medium group"
                  >
                    <span className="flex items-center">
                      {item.name}
                      <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <Separator className="bg-zinc-800 mb-8" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-zinc-400 text-sm">
                © 2025 QuizAI. Crafted with care for learners worldwide.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item, index) => (
                  <div key={item} className="flex items-center">
                    <a
                      href="#"
                      className="text-zinc-400  hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                      {item}
                    </a>
                    {index < 2 && (
                      <Separator
                        orientation="vertical"
                        className="h-4 ml-6 bg-zinc-600 "
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </AnimatedElement>
      </div>
    </footer>
  );
}
