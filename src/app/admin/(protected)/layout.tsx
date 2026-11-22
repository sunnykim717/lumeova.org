import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { SignOutButton } from "@/components/admin/SignOutButton";

const ADMIN_NAV = [
  { label: "대시보드", href: "/admin/dashboard" },
  { label: "회원", href: "/admin/members" },
  { label: "후원", href: "/admin/donations" },
  { label: "후원자 명단", href: "/admin/supporters" },
  { label: "사업", href: "/admin/projects" },
  { label: "소식", href: "/admin/news" },
  { label: "현장 이야기", href: "/admin/field-stories" },
  { label: "홈 화면", href: "/admin/content" },
  { label: "휴지통", href: "/admin/trash" },
  { label: "변경 이력", href: "/admin/history" },
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
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-4 py-2 sm:px-5 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-x-5">
          <Link href="/admin/dashboard" className="font-display text-[15px] text-white">
            lumeova admin
          </Link>
          <nav aria-label="관리자 메뉴" className="col-span-2 row-start-2 flex flex-wrap gap-x-4 xl:col-span-1 xl:row-start-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center text-[13px] text-cream/70 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-2 text-[12.5px] text-cream/60 xl:col-start-3">
            <span className="hidden truncate sm:inline">
              {admin.displayName ?? admin.email} · {ROLE_LABEL[admin.role] ?? admin.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl min-w-0 px-4 py-6 sm:px-5 sm:py-10">{children}</main>
    </div>
  );
}
