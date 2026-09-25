import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "outline-light";

// Each variant fully owns its own bg/text/border classes so callers never
// need to fight them with an overriding className — Tailwind's generated
// CSS order (not class-string order) decides which utility wins when two
// classes touch the same property, so mixing a variant with a conflicting
// override className is a silent bug, not a visual override.
const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-navy text-cream hover:bg-navy-light",
  secondary: "bg-transparent text-navy border border-navy hover:bg-navy hover:text-cream",
  ghost: "bg-transparent text-navy hover:text-gold-dark",
  // Gold fill with navy text — for a primary CTA placed over a photo or a
  // dark panel, where the navy `primary` variant would disappear.
  gold: "bg-gold text-navy hover:bg-gold-dark",
  // Outlined in cream — for a secondary CTA over a photo or a dark panel,
  // where the navy `secondary` variant's border/text would be unreadable.
  "outline-light": "bg-transparent text-cream border border-cream hover:bg-cream hover:text-navy",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function LinkButton({ href, variant = "primary", className = "", children }: LinkButtonProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT_CLASS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${BASE} ${VARIANT_CLASS[variant]} ${className}`} {...props} />;
}
