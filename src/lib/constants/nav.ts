export type NavItem = {
  label: string;
  href: string;
};

export const MAIN_NAV: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "단체소개", href: "/about" },
  { label: "활동", href: "/what-we-do" },
  { label: "프로젝트", href: "/projects" },
  { label: "소식", href: "/news" },
  { label: "회원가입", href: "/membership" },
  { label: "후원하기", href: "/donate" },
  { label: "문의", href: "/contact" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
  { label: "문의하기", href: "/contact" },
];
