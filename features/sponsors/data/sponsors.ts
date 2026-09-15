export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  /** Reserved for the future sponsor detail popover. */
  description?: string;
};

export const sponsors: Sponsor[] = [
  {
    id: "ibpa",
    name: "International Beauty Professionals Association",
    logo: "/images/sponsors/ibpa.png",
  },
  {
    id: "andreeva-consulting",
    name: "Andreeva Consulting Inc",
    logo: "/images/sponsors/andreeva-consulting.png",
  },
  {
    id: "nepop-radio",
    name: "NePop Radio",
    logo: "/images/sponsors/nepop-media.png",
  },
];
