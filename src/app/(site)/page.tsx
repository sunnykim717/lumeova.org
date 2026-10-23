import { Hero } from "@/components/home/Hero";
import { BrandMessage } from "@/components/home/BrandMessage";
import { AboutSummary } from "@/components/home/AboutSummary";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { RecentProjects } from "@/components/home/RecentProjects";
import { RecentNews } from "@/components/home/RecentNews";
import { GetInvolved } from "@/components/home/GetInvolved";
import { getSiteContent } from "@/lib/data/content";

export default async function Home() {
  const [hero, about, whatWeDo, getInvolved] = await Promise.all([
    getSiteContent("hero"),
    getSiteContent("about_summary"),
    getSiteContent("what_we_do"),
    getSiteContent("get_involved"),
  ]);

  return (
    <>
      <Hero slides={hero.slides} />
      <BrandMessage />
      <AboutSummary content={about} />
      <WhatWeDo content={whatWeDo} />
      <RecentProjects />
      <RecentNews />
      <GetInvolved content={getInvolved} />
    </>
  );
}
