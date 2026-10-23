export type ProjectCategory = "education_support" | "leadership_support";

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "education_support", label: "교육지원" },
  { value: "leadership_support", label: "리더십지원" },
];

export function isProjectCategory(value: unknown): value is ProjectCategory {
  return PROJECT_CATEGORIES.some((c) => c.value === value);
}

export function projectCategoryLabel(value: string | null): string | null {
  return PROJECT_CATEGORIES.find((c) => c.value === value)?.label ?? null;
}
