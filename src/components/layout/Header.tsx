"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_NAV, type NavItem } from "@/lib/constants/nav";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const onMove = (event: MouseEvent) => {
      if (!pointer.matches || window.scrollY <= 84) {
        setRevealed(false);
        return;
      }
      setRevealed((visible) => event.clientY <= (visible ? 84 : 16));
    };
    const onScroll = () => { if (window.scrollY <= 84) setRevealed(false); };
    const onLeave = () => setRevealed(false);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  const transparent = isHome && !revealed;

  return (
    <div className={revealed ? "h-[84px]" : undefined}>
    <header
      className={`${revealed ? "fixed inset-x-0 top-0 shadow-md" : "relative"} z-40 transition-colors duration-300 ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-b border-border/80 bg-cream/95 backdrop-blur"
      }`}
    >
      <div className="section-wrap flex h-[84px] items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0" onClick={() => { setOpen(false); setRevealed(false); }}>
          <Logo
            size="header"
            className="hidden md:inline-flex"
          />
          <Logo
            size="header-mobile"
            className="inline-flex md:hidden"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 text-[14px] xl:text-[15px] font-medium tracking-wide">
          {MAIN_NAV.map((item) => (
            <DesktopNavItem key={item.href + item.label} item={item} pathname={pathname} transparent={transparent} />
          ))}
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
            <MobileNavList
              items={MAIN_NAV}
              depth={0}
              pathname={pathname}
              transparent={transparent}
              onNavigate={() => { setOpen(false); setRevealed(false); }}
            />
          </ul>
        </nav>
      )}
    </header>
    </div>
  );
}

function isActive(href: string, pathname: string) {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

/** Links with a query string (e.g. ?category=) share a path with their parent, so only the parent is highlighted. */
function isActiveNavLink(href: string, pathname: string) {
  return !href.includes("?") && isActive(href, pathname);
}

function DesktopNavItem({ item, pathname, transparent }: { item: NavItem; pathname: string; transparent: boolean }) {
  const active = isActive(item.href, pathname);
  const linkClass = `whitespace-nowrap py-1 border-b-2 transition-colors duration-300 ${
    active
      ? "border-gold text-gold"
      : transparent
      ? "border-transparent text-cream hover:text-gold"
      : "border-transparent text-navy hover:text-gold-dark"
  }`;

  if (!item.children) {
    return (
      <Link href={item.href} className={linkClass}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link href={item.href} className={linkClass}>
        {item.label}
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="min-w-[180px] rounded-sm border border-border bg-cream py-2 shadow-md">
          <DesktopSubList items={item.children} depth={0} pathname={pathname} />
        </div>
      </div>
    </div>
  );
}

function DesktopSubList({ items, depth, pathname }: { items: NavItem[]; depth: number; pathname: string }) {
  return (
    <>
      {items.map((child) => {
        const active = isActiveNavLink(child.href, pathname);
        return (
          <div key={child.href + child.label}>
            <Link
              href={child.href}
              className={`block whitespace-nowrap py-2 pr-5 text-[14px] transition-colors hover:bg-navy/5 ${
                active ? "text-gold-dark font-semibold" : "text-navy hover:text-gold-dark"
              }`}
              style={{ paddingLeft: 16 + depth * 16 }}
            >
              {child.label}
            </Link>
            {child.children && <DesktopSubList items={child.children} depth={depth + 1} pathname={pathname} />}
          </div>
        );
      })}
    </>
  );
}

function MobileNavList({
  items,
  depth,
  pathname,
  transparent,
  onNavigate,
}: {
  items: NavItem[];
  depth: number;
  pathname: string;
  transparent: boolean;
  onNavigate: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = isActiveNavLink(item.href, pathname);
        return (
          <li key={item.href + item.label}>
            <Link
              href={item.href}
              className={`block py-3.5 font-medium transition-colors ${depth === 0 ? "text-[17px]" : "text-[15px]"} ${
                active
                  ? "text-gold"
                  : transparent
                  ? "text-cream hover:text-gold"
                  : "text-navy hover:text-gold-dark"
              }`}
              style={{ paddingLeft: depth * 16 }}
              onClick={onNavigate}
            >
              {depth > 0 && "· "}
              {item.label}
            </Link>
            {item.children && (
              <ul className="flex flex-col">
                <MobileNavList
                  items={item.children}
                  depth={depth + 1}
                  pathname={pathname}
                  transparent={transparent}
                  onNavigate={onNavigate}
                />
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}
