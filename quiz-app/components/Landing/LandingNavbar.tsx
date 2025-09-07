"use client";
import logo from "../../public/quizzy_logo.png";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ModeToggle } from "../Modetoggle";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function NavbarDemo() {
  const { user } = useUser();
  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative sticky top-0 z-50">
      <Navbar>
        <NavBody>
          <NavbarLogo logo={logo.src} />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton
              variant="secondary"
              className="px-0 py-0 outline-none"
            >
              {" "}
              <ModeToggle />
            </NavbarButton>
            {!user?.emailAddresses[0].emailAddress && (
              <Link href={"/login"}>
                <NavbarButton variant="primary"> Login</NavbarButton>
              </Link>
            )}
          </div>
        </NavBody>
        <MobileNav>
          <MobileNavHeader className="">
            <NavbarLogo logo={logo.src} />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            className="mt-4"
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full   flex-col gap-4">
              <ModeToggle />
              {!user?.emailAddresses[0].emailAddress && (
                <Link href={"/login"}>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="max-w-[100px]"
                  >
                    Login
                  </NavbarButton>
                </Link>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
