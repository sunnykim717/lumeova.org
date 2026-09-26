import Image from "next/image";
import { ORG } from "@/lib/constants/brand";

type LogoSize = "header" | "header-mobile" | "brand-mark" | "brand-story" | "footer" | "footer-mobile";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP: Record<LogoSize, { w: number; h: number; width: number; src: string }> = {
  // Production logo assets
  header: { w: 300, h: 267, width: 300, src: "/brand/logo/lumeova-ko-primary.png" },
  "header-mobile": { w: 200, h: 178, width: 200, src: "/brand/logo/lumeova-ko-primary.png" },
  "brand-mark": { w: 90, h: 80, width: 90, src: "/logo/symbol-gold.png" },
  "brand-story": { w: 290, h: 258, width: 290, src: "/brand/logo/lumeova-ko-primary.png" },
  footer: { w: 200, h: 178, width: 200, src: "/brand/logo/lumeova-ko-reverse.png" },
  "footer-mobile": { w: 160, h: 142, width: 160, src: "/brand/logo/lumeova-ko-reverse.png" },
};

export function Logo({
  size = "header",
  className = "",
  onClick,
}: LogoProps) {
  const sizeConfig = SIZE_MAP[size];

  return (
    <div
      className={`inline-flex flex-shrink-0 ${className}`}
      style={{ width: `${sizeConfig.width}px`, height: "auto" }}
      onClick={onClick}
    >
      <Image
        src={sizeConfig.src}
        alt={`${ORG.nameEn} 로고`}
        width={sizeConfig.w}
        height={sizeConfig.h}
        priority
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
