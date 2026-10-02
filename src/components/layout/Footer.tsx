import Image from "next/image";
import Link from "next/link";
import { ORG, DONATION_ACCOUNT } from "@/lib/constants/brand";
import { FOOTER_LINKS } from "@/lib/constants/nav";

export function Footer() {
  return (
    <footer className="bg-navy text-cream/80">
      <div className="section-wrap py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/brand/logo/lumeova-ko-reverse.png"
            alt={`${ORG.nameEn} · ${ORG.nameKo}`}
            width={980}
            height={290}
            className="h-auto w-[240px] max-w-full md:w-[260px] mb-5"
          />
          <p className="text-[15px] leading-relaxed">
            LUMEOVA International
            <br />
            {ORG.nameKo}
            <br />
            {ORG.sloganKo}
          </p>
        </div>

        <div className="text-[15px] leading-relaxed space-y-1">
          <p className="text-cream/50 uppercase tracking-wide text-[11px] mb-2">연락처</p>
          <p>{ORG.phone ?? "연락처 확정 후 표기 예정"}</p>
          <p>{ORG.email ?? "이메일 확정 후 표기 예정"}</p>
        </div>

        <div className="text-[15px] leading-relaxed space-y-1">
          <p className="text-cream/50 uppercase tracking-wide text-[11px] mb-2">후원계좌</p>
          <p>
            {DONATION_ACCOUNT.bank} {DONATION_ACCOUNT.accountNumber}
          </p>
          <p>예금주: {DONATION_ACCOUNT.holder}</p>
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
