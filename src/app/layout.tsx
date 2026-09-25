import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ORG, SITE_URL } from "@/lib/constants/brand";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-var",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans-var",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${ORG.nameKo} | ${ORG.nameEn}`,
    template: `%s | ${ORG.nameKo}`,
  },
  description: ORG.sloganKo,
  openGraph: {
    title: `${ORG.nameKo} | ${ORG.nameEn}`,
    description: ORG.sloganKo,
    url: SITE_URL,
    siteName: ORG.nameKo,
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/logo/symbol.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${playfair.variable} ${notoSansKr.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
