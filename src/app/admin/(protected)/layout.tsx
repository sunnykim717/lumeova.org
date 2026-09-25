import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { SignOutButton } from "@/components/admin/SignOutButton";

const ADMIN_NAV = [
  { label: "대시보드", href: "/admin/dashboard" },
  { label: "회원", href: "/admin/members" },
  { label: "후원", href: "/admin/donations" },
  { label: "사업", href: "/admin/projects" },
  { label: "소식", href: "/admin/news" },
];

const ROLE_LABEL: Record<string, string> = {
  super_admin: "최고관리자",
  manager: "매니저",
  staff: "스태프",
  viewer: "열람전용",
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-cream/90">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="font-display text-[15px] text-white">
              lumeova admin
            </Link>
            <nav className="flex gap-5">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[13px] text-cream/70 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-[12.5px] text-cream/60">
            <span>
              {admin.displayName ?? admin.email} · {ROLE_LABEL[admin.role] ?? admin.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-10">{children}</main>
    </div>
  );
}
