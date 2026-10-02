import type { Metadata } from "next";
import { BrandHero } from "@/components/brand/BrandHero";
import { BrandStory } from "@/components/brand/BrandStory";
import { BrandMeaning } from "@/components/brand/BrandMeaning";
import { BrandSignature } from "@/components/brand/BrandSignature";
import { BRAND_MESSAGE, BRAND_STORY_PARAGRAPHS } from "@/lib/constants/brandStory";
import { ORG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "브랜드 스토리",
  description: `${BRAND_MESSAGE} — ${ORG.nameKo}(${ORG.nameEn})의 이름과 CI에 담긴 뜻`,
  openGraph: {
    title: `브랜드 스토리 | ${ORG.nameKo}`,
    description: BRAND_STORY_PARAGRAPHS[0].replace(/\n/g, " "),
  },
};

export default function BrandStoryPage() {
  return (
    <div>
      <BrandHero />
      <BrandStory />
      <BrandMeaning />
      <BrandSignature />
    </div>
  );
}
