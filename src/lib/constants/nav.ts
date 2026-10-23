export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const MAIN_NAV: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "단체소개", href: "/about" },
  { label: "활동", href: "/what-we-do" },
  {
    label: "사업",
    href: "/projects",
    children: [
      { label: "교육지원", href: "/projects?category=education_support" },
      { label: "리더십지원", href: "/projects?category=leadership_support" },
    ],
  },
  { label: "소식", href: "/news" },
  {
    label: "후원자 모집",
    href: "/membership",
    children: [
      {
        label: "회원가입",
        href: "/membership",
        children: [
          { label: "일반회원", href: "/membership?type=general" },
          { label: "정회원", href: "/membership?type=regular" },
        ],
      },
    ],
  },
  { label: "후원하기", href: "/donate" },
  { label: "문의", href: "/contact" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
  { label: "문의하기", href: "/contact" },
];
