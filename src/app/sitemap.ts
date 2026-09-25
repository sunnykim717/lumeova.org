import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/brand";
import { getAllProjects, getAllNews } from "@/lib/data/content";

const STATIC_PATHS = [
  "",
  "/about",
  "/what-we-do",
  "/projects",
  "/news",
  "/membership",
  "/donate",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news] = await Promise.all([getAllProjects(), getAllNews()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));

  const newsEntries: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${n.slug}`,
    lastModified: new Date(n.updated_at),
  }));

  return [...staticEntries, ...projectEntries, ...newsEntries];
}
