import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ORG, DONATION_ACCOUNT } from "@/lib/constants/brand";
import { FOOTER_LINKS } from "@/lib/constants/nav";

export function Footer() {
  return (
    <footer className="bg-navy text-cream/80">
      <div className="section-wrap py-12">
        {/* 세로선 + Logo */}
        <div className="flex gap-6 md:gap-8 mb-12 pb-12 border-b border-white/10">
          <div className="w-1 bg-gradient-to-b from-gold to-gold/40 flex-shrink-0"></div>

          <div className="flex flex-col">
            {/* Logo */}
            <Logo
              size="footer"
              className="hidden md:inline-flex flex-shrink-0"
            />
            <Logo
              size="footer-mobile"
              className="inline-flex md:hidden flex-shrink-0"
            />

            {/* 슬로건 */}
            <p className="text-[16px] md:text-[19px] text-white/90 font-semibold leading-relaxed mt-8 md:mt-10">
              {ORG.sloganKo}
            </p>
          </div>
        </div>

        {/* 연락처 + 후원계좌 */}
        <div className="grid gap-10 md:grid-cols-2">
          <div className="text-[13px] leading-relaxed space-y-1">
            <p className="text-cream/50 uppercase tracking-wide text-[11px] mb-2">대표전화</p>
            <p>+82-10-2543-3659</p>
            <p className="text-cream/50 uppercase tracking-wide text-[11px] mb-2 mt-4">이메일</p>
            <p>lumeova.int@gmail.com</p>
          </div>

          <div className="text-[13px] leading-relaxed space-y-1">
            <p className="text-cream/50 uppercase tracking-wide text-[11px] mb-2">후원계좌</p>
            <p>
              {DONATION_ACCOUNT.bank} {DONATION_ACCOUNT.accountNumber}
            </p>
            <p>예금주: {DONATION_ACCOUNT.holder}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-wrap py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-cream/50">
          <p>&copy; {new Date().getFullYear()} {ORG.nameKo} ({ORG.nameEn}). All rights reserved.</p>
          <div className="flex gap-4">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-cream">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
