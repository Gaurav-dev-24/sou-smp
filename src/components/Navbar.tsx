import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavItem } from "@/types";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useTheme } from "@/lib/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { LOGOS } from "@/lib/logos";

/* ---------------- NAV STRUCTURE ---------------- */

const NAV_ITEMS: NavItem[] = [
  { title: "Home", href: "/" },
  {
    title: "About",
    children: [
      { title: "IEEE", href: "/about/ieee" },
      { title: "IEEE SOU SB", href: "/about/ieee-sou-sb" },
      {
        title: "CHAPTER",
        children: [
          { title: "IEEE SOU SPS SBC", href: "/about/ieee-sou-sps-sbc" },
          { title: "IEEE SOU CS SBC", href: "/about/ieee-sou-cs-sbc" },
        ],
      },
      {
        title: "GROUP",
        children: [
          { title: "IEEE SOU WIE SB AG", href: "/about/ieee-sou-wie-sb-ag" },
          { title: "IEEE SOU SIGHT SBG", href: "/about/ieee-sou-sight-sbg" },
        ],
      },
      { title: "Our SIGs", href: "/sigs" },
    ],
  },
  { title: "Events", href: "/events" },
  {
    title: "Team",
    children: [
      { title: "Faculty Advisor", href: "/team/faculty-advisor" },
      { title: "Advisory Board", href: "/team/advisory-board" },
      { title: "Executive Members", href: "/team/executive-members" },
    ],
  },
  {
    title: "Achievement",
    children: [
      { title: "Branch Awards", href: "/achievement/branch-awards" },
      { title: "Newsletter", href: "/achievement/newsletter" },
      { title: "Student Achievement", href: "/achievement/student" },
    ],
  },
  {
    title: "Blogs",
    children: [
      { title: "All Blogs", href: "/blogs" },
      { title: "Article", href: "/blogs/category/article" },
    ],
  },
  { title: "Bylaws", href: "/bylaws" },
  { title: "Contact Us", href: "/contact" },
];

const HOVER_THEMES: Record<string, string> = {
  "IEEE": "hover:bg-blue-50/50 hover:text-blue-600 dark:hover:bg-blue-900/20",
  "IEEE SOU SB": "hover:bg-blue-50/50 hover:text-blue-600 dark:hover:bg-blue-900/20",
  "IEEE SOU SPS SBC": "hover:bg-green-50/50 hover:text-green-600 dark:hover:bg-green-900/20",
  "IEEE SOU CS SBC": "hover:bg-orange-50/50 hover:text-orange-600 dark:hover:bg-orange-900/20",
  "IEEE SOU WIE SB AG": "hover:bg-purple-50/50 hover:text-purple-600 dark:hover:bg-purple-900/20",
  "IEEE SOU SIGHT SBG": "hover:bg-orange-50/50 hover:text-orange-600 dark:hover:bg-orange-900/20"
};

/* ---------------- COMPONENT ---------------- */

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileDropdownToggle = (title: string) => {
    setOpenDropdown((prev) => (prev === title ? null : title));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ═══════════════ MAIN NAVBAR ═══════════════ */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 py-0",
          isScrolled
            ? "bg-white dark:bg-[#000814]/95 shadow-lg dark:backdrop-blur-md"
            : "bg-white dark:bg-[#000814]"
        )}
      >
        {/* Navigation */}
        <div className="max-w-[1440px] mx-auto relative px-4">
          <div className={cn(
            "flex items-center justify-between transition-all duration-500",
            isScrolled ? "h-[60px]" : "h-[70px]"
          )}>

            {/* Left: Logo and Navigation Menu */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center group">
                {theme === "dark" ? (
                  <div className="flex items-center gap-2 transition-all duration-300 group-hover:scale-105 h-9 sm:h-10 md:h-11">
                    <img loading="lazy"
                      src="http://ieee.socet.edu.in/wp-content/uploads/2026/03/N-SOU-X-NAAC-Logo-NW-SOU-X-NAAC-Logo.png"
                      alt="Silver Oak Logo"
                      className="h-full w-auto object-contain flex-shrink-0"
                    />
                    <img loading="lazy"
                      src="http://ieee.socet.edu.in/wp-content/uploads/2026/03/IEEE-New-Logo-White-scaled.png"
                      alt="IEEE Logo"
                      className="h-full w-auto object-contain flex-shrink-0"
                    />
                  </div>
                ) : (
                  <img loading="lazy"
                    src={LOGOS.LIGHT.IEEESOUSSB}
                    className="h-10 sm:h-11 md:h-12 lg:h-14 w-auto object-contain transition-all duration-300 flex-shrink-0 hover:scale-105"
                    alt="IEEE SOU SB"
                  />
                )}
              </Link>

              {/* Navigation Menu */}
              <nav className="hidden lg:flex items-center space-x-1 lg:px-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.title} className="relative group">
                    {item.children ? (
                      <NavigationMenu>
                        <NavigationMenuList>
                          <NavigationMenuItem>
                            <NavigationMenuTrigger className={cn(
                              "text-xs xl:text-sm font-semibold transition-all duration-300 px-3 xl:px-4 py-2 hover:bg-primary/5 rounded-md",
                              isActive(item.href || "") ? "text-primary" : "text-foreground dark:text-gray-300"
                            )}>
                              {item.title}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <div className="w-64 p-3 bg-white dark:bg-slate-900 border border-border/50 rounded-lg shadow-xl">
                                {item.children.map((child) => (
                                  <React.Fragment key={child.title}>
                                    {child.children ? (
                                      <>
                                        <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center border-b border-border/10 mb-1">
                                          {child.title}
                                        </p>
                                        {child.children.map((nested) => (
                                          <NavigationMenuLink asChild key={nested.title}>
                                            <Link
                                              to={nested.href}
                                              className={cn(
                                                "block px-3 py-2 text-sm text-center rounded-md transition-all duration-200 hover:translate-x-0",
                                                HOVER_THEMES[nested.title] || "hover:bg-accent text-foreground"
                                              )}
                                            >
                                              {nested.title}
                                            </Link>
                                          </NavigationMenuLink>
                                        ))}
                                      </>
                                    ) : (
                                      <NavigationMenuLink asChild>
                                        <Link
                                          to={child.href}
                                          className={cn(
                                            "block px-3 py-2 text-sm text-center rounded-md transition-all duration-200 hover:translate-x-0",
                                            HOVER_THEMES[child.title] || "hover:bg-accent text-foreground"
                                          )}
                                        >
                                          {child.title}
                                        </Link>
                                      </NavigationMenuLink>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </NavigationMenuContent>
                          </NavigationMenuItem>
                        </NavigationMenuList>
                      </NavigationMenu>
                    ) : (
                      <Link
                        to={item.href || "/"}
                        className={cn(
                          "relative px-3 xl:px-4 py-2 text-xs xl:text-sm font-semibold transition-all duration-300 hover:text-primary whitespace-nowrap",
                          isActive(item.href || "")
                            ? "text-primary dark:text-white"
                            : "text-foreground dark:text-gray-300"
                        )}
                      >
                        {item.title}
                        {isActive(item.href || "") && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute bottom-0 left-3 xl:left-4 right-3 xl:right-4 h-0.5 bg-primary"
                          />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-4">
              {/* Join Button (Desktop & Tablet) */}
              <Button variant="outline" size="sm" asChild className="hidden lg:flex transition-all duration-300 hover:scale-105 bg-blue-600 text-white hover:bg-white hover:text-blue-600 border-none shadow-md px-6 z-10">
                <Link to="/join">Join IEEE</Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="transition-all duration-300 hover:scale-110 text-foreground dark:text-gray-300 h-9 w-9"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════ MOBILE MENU ═══════════════ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[80vw] max-w-sm h-full bg-white dark:bg-[#000814] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 pt-24 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <div key={item.title}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => handleMobileDropdownToggle(item.title)}
                          className={cn(
                            "flex items-center justify-center w-full py-3 px-4 text-base font-bold rounded-lg transition-all text-center",
                            openDropdown === item.title ? "bg-primary/10 text-primary" : "text-foreground"
                          )}
                        >
                          {item.title}
                          <ChevronDown className={cn(
                            "h-5 w-5 transition-transform duration-300 ml-2",
                            openDropdown === item.title && "rotate-180"
                          )} />
                        </button>

                        <div className={cn(
                          "overflow-hidden transition-all duration-300",
                          openDropdown === item.title ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                        )}>
                          <div className="pl-0 space-y-1 py-2">
                            {item.children.map((child) => (
                              <React.Fragment key={child.title}>
                                {child.children ? (
                                  <>
                                    <p className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-[0.2em] text-center border-l-0 border-primary/20">
                                      {child.title}
                                    </p>
                                    {child.children.map((nested) => (
                                      <Link
                                        key={nested.title}
                                        to={nested.href}
                                        className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md text-center"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                      >
                                        {nested.title}
                                      </Link>
                                    ))}
                                  </>
                                ) : (
                                  <Link
                                    to={child.href}
                                    className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {child.title}
                                  </Link>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.href || "/"}
                        className={cn(
                          "block py-3 px-4 text-base font-bold rounded-lg transition-all text-center",
                          isActive(item.href || "") ? "bg-primary text-white" : "text-foreground hover:bg-accent"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}

                <div className="pt-8 px-4">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg shadow-blue-500/20">
                    <Link to="/join" onClick={() => setIsMobileMenuOpen(false)}>Join IEEE</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
