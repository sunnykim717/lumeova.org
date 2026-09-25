import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Lumeova Admin",
    default: "관리자",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
