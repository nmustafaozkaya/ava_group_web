"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import LanguageSwitcher from "./LanguageSwitcher";
import { ContactSheet } from "./ContactSheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// Sürgülü Tema Toggle Bileşeni
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-12 h-6 rounded-full bg-gray-300 animate-pulse" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-12 h-6 rounded-full p-0.5 transition-all duration-300 ease-in-out
        ${
          isDark
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-purple-500/30"
            : "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md shadow-yellow-500/30"
        }
        hover:shadow-lg transform hover:scale-105 active:scale-95
      `}
      aria-label="Tema değiştir"
    >
      {/* Sürgülü Daire */}
      <div
        className={`
          w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center
          transition-all duration-300 ease-in-out transform
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {/* İkon Geçişi */}
        <div className="relative w-3 h-3">
          <Sun
            className={`
              absolute inset-0 w-3 h-3 text-yellow-500 transition-all duration-300
              ${
                isDark
                  ? "opacity-0 rotate-180 scale-0"
                  : "opacity-100 rotate-0 scale-100"
              }
            `}
          />
          <Moon
            className={`
              absolute inset-0 w-3 h-3 text-indigo-600 transition-all duration-300
              ${
                isDark
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-180 scale-0"
              }
            `}
          />
        </div>
      </div>

      {/* Arka Plan İkonları */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun
          className={`
            w-3 h-3 text-white/50 transition-all duration-300
            ${!isDark ? "opacity-0" : "opacity-100"}
          `}
        />
        <Moon
          className={`
            w-3 h-3 text-white/50 transition-all duration-300
            ${isDark ? "opacity-0" : "opacity-100"}
          `}
        />
      </div>
    </button>
  );
};

export default function Navbar() {
  const t = useTranslations("Navbar");
  const [activeLink, setActiveLink] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#completed-projects") setActiveLink("previous");
      else if (hash === "#under-construction-projects")
        setActiveLink("current");
      else if (hash === "#in-design-projects") setActiveLink("upcoming");
      else setActiveLink("home");
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
    setIsMenuOpen(false);
  };

  const handleContactClick = () => {
    setIsMenuOpen(false);
    setIsContactSheetOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.jpg"
              alt="Company Logo"
              width={40}
              height={40}
              priority
              draggable="false"
            />
          </Link>
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            <Link
              href="#completed-projects"
              className={`text-foreground/60 hover:text-foreground/80 transition ${
                activeLink === "previous" ? "text-foreground font-semibold" : ""
              }`}
              onClick={() => handleLinkClick("previous")}
            >
              {t("completedProjects")}
            </Link>
            <Link
              href="#under-construction-projects"
              className={`text-foreground/60 hover:text-foreground/80 transition ${
                activeLink === "current" ? "text-foreground font-semibold" : ""
              }`}
              onClick={() => handleLinkClick("current")}
            >
              {t("underConstructionProjects")}
            </Link>
            <Link
              href="#in-design-projects"
              className={`text-foreground/60 hover:text-foreground/80 transition ${
                activeLink === "upcoming" ? "text-foreground font-semibold" : ""
              }`}
              onClick={() => handleLinkClick("upcoming")}
            >
              {t("upcomingProjects")}
            </Link>
          </div>
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t("openSettings")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-background"
                align="end"
                forceMount
              >
                <DropdownMenuLabel>{t("settings")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm">{t("theme")}</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm">{t("language")}</span>
                    <LanguageSwitcher />
                  </div>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="secondary"
              size="icon"
              aria-label={t("mobileMenu")}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-y-0 right-0 w-64 z-[60] bg-background text-foreground transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-lg`}
        style={{ transform: isMenuOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X size={28} />
            </button>
            <span className="text-lg font-bold text-foreground">AVA GROUP</span>
          </div>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            href="#completed-projects"
            className="block rounded-md p-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleLinkClick("previous")}
          >
            {t("completedProjects")}
          </Link>
          <Link
            href="#under-construction-projects"
            className="block rounded-md p-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleLinkClick("current")}
          >
            {t("underConstructionProjects")}
          </Link>
          <Link
            href="#in-design-projects"
            className="block rounded-md p-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleLinkClick("upcoming")}
          >
            {t("upcomingProjects")}
          </Link>
        </nav>
        <div className="mt-auto p-4">
          <div className="pb-4">
            <button
              onClick={handleContactClick}
              className="w-full flex items-center justify-center p-3 text-base font-medium rounded-md text-foreground bg-secondary hover:bg-secondary/80"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("contactButton")}
            </button>
          </div>
          <Separator className="my-0 bg-border" />
          <div className="rounded-lg border bg-muted/50 p-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("theme")}
                </span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("language")}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
      <ContactSheet
        open={isContactSheetOpen}
        onOpenChange={setIsContactSheetOpen}
      />
    </>
  );
}
