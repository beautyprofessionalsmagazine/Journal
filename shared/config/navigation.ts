import { categoryConfigs } from "@/features/categories/data/categories";

export const mainNavigation = [
  ...categoryConfigs.map((category) => ({
    name: category.name,
    href: category.href,
    subcategories: category.subcategories,
  })),
  {
    name: "Video",
    href: "/video",
    subcategories: [],
  },
  {
    name: "PhotoVogue",
    href: "/photovogue",
    subcategories: [],
  },
  {
    name: "Archive",
    href: "/archive",
    subcategories: [],
  },
];

export const serviceNavigation = [
  { name: "About", slug: "about" },
  { name: "Subscribe", slug: "subscribe" },
  { name: "Contacts", slug: "contacts" },
  { name: "Collaboration", slug: "collaboration" },
  { name: "Careers", slug: "careers" },
  { name: "User Agreement", slug: "user-agreement" },
  { name: "Privacy Policy", slug: "privacy-policy" },
  { name: "Current Issue", slug: "current-issue" },
  { name: "Account", slug: "account" },
  { name: "Newsletter", slug: "newsletter" },
];
