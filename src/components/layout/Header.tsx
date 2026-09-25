"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MAIN_NAV } from "@/lib/constants/nav";
import { ORG } from "@/lib/constants/brand";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-b border-border/80 bg-cream/95 backdrop-blur"
      }`}
    >
      <div className="section-wrap flex h-[84px] items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0 gap-2" onClick={() => setOpen(false)}>
          <div className="flex flex-col gap-0">
            <Logo
              size="header"
              className="hidden md:inline-flex"
            />
            <p className="hidden md:block text-[11px] font-medium tracking-wide text-cream/80 -mt-1">
              {ORG.sloganKo}
            </p>
            <Logo
              size="header-mobile"
              className="inline-flex md:hidden"
            />
            <p className="inline-flex md:hidden text-[9px] font-medium tracking-wide text-cream/80 -mt-0.5">
              {ORG.sloganKo}
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium tracking-wide">
          {MAIN_NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap py-1 border-b-2 transition-colors duration-300 ${
                  active
                    ? "border-gold text-gold"
                    : transparent
                    ? "border-transparent text-cream hover:text-gold"
                    : "border-transparent text-navy hover:text-gold-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="lg:hidden inline-flex flex-col gap-[5px] p-2 -mr-2"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-[2px] w-7 transition-all duration-300 ${
              transparent ? "bg-cream" : "bg-navy"
            } ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-[2px] w-7 transition-all duration-300 ${
              transparent ? "bg-cream" : "bg-navy"
            } ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-[2px] w-7 transition-all duration-300 ${
              transparent ? "bg-cream" : "bg-navy"
            } ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className={`lg:hidden border-t ${
            transparent ? "border-white/20 bg-navy" : "border-border bg-cream"
          }`}
        >
          <ul className="section-wrap flex flex-col py-3">
            {MAIN_NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-3.5 text-[17px] font-medium transition-colors ${
                      active
                        ? "text-gold"
                        : transparent
                        ? "text-cream hover:text-gold"
                        : "text-navy hover:text-gold-dark"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
