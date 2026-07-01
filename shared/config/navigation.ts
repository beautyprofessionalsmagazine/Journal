import { categoryConfigs } from "@/features/articles/data/categories";

export const mainNavigation = [
  ...categoryConfigs,
  {
    name: "Video",
    slug: "video",
    subcategories: [],
  },
  {
    name: "PhotoVogue",
    slug: "photovogue",
    subcategories: [],
  },
  {
    name: "Archive",
    slug: "archive",
    subcategories: [],
  },
];

export const serviceNavigation = [
  { name: "About", slug: "about" },
  { name: "Contacts", slug: "contacts" },
  { name: "Collaboration", slug: "collaboration" },
  { name: "Careers", slug: "careers" },
  { name: "User Agreement", slug: "user-agreement" },
  { name: "Privacy Policy", slug: "privacy-policy" },
  { name: "Current Issue", slug: "current-issue" },
  { name: "Account", slug: "account" },
  { name: "Newsletter", slug: "newsletter" },
];
