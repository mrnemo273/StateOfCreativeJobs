import type { JobTitle } from "@/types";

export const TRACKED_JOB_TITLES: JobTitle[] = [
  // Cluster A: Design Leadership
  { title: "Creative Director", slug: "creative-director", cluster: "design-leadership" },
  { title: "Design Director", slug: "design-director", cluster: "design-leadership" },
  { title: "Head of Design", slug: "head-of-design", cluster: "design-leadership" },
  { title: "VP of Design", slug: "vp-of-design", cluster: "design-leadership" },
  { title: "Chief Creative Officer", slug: "cco", cluster: "design-leadership" },

  // Cluster B: Product & UX Design
  { title: "Senior Product Designer", slug: "senior-product-designer", cluster: "product-ux" },
  { title: "UX Designer", slug: "ux-designer", cluster: "product-ux" },
  { title: "Product Designer", slug: "product-designer", cluster: "product-ux" },
  { title: "UX Researcher", slug: "ux-researcher", cluster: "product-ux" },
  { title: "Design Systems Designer", slug: "design-systems-designer", cluster: "product-ux" },

  // Cluster C: Brand & Visual Design
  { title: "Brand Designer", slug: "brand-designer", cluster: "brand-visual" },
  { title: "Graphic Designer", slug: "graphic-designer", cluster: "brand-visual" },
  { title: "Visual Designer", slug: "visual-designer", cluster: "brand-visual" },
  { title: "Art Director", slug: "art-director", cluster: "brand-visual" },
  { title: "Motion Designer", slug: "motion-designer", cluster: "brand-visual" },

  // Cluster D: Content & Copy
  { title: "Copywriter", slug: "copywriter", cluster: "content-copy" },
  { title: "Content Strategist", slug: "content-strategist", cluster: "content-copy" },
  { title: "UX Writer", slug: "ux-writer", cluster: "content-copy" },
  { title: "Creative Copywriter", slug: "creative-copywriter", cluster: "content-copy" },
  { title: "Content Designer", slug: "content-designer", cluster: "content-copy" },
];
