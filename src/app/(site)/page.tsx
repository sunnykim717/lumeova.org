import { Hero } from "@/components/home/Hero";
import { AboutSummary } from "@/components/home/AboutSummary";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { RecentProjects } from "@/components/home/RecentProjects";
import { RecentNews } from "@/components/home/RecentNews";
import { GetInvolved } from "@/components/home/GetInvolved";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSummary />
      <WhatWeDo />
      <RecentProjects />
      <RecentNews />
      <GetInvolved />
    </>
  );
}
