export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  description: string[];
};

export const sponsors: Sponsor[] = [
  {
    id: "ibpa",
    name: "International Beauty Professionals Association",
    logo: "/images/sponsors/ibpa.png",
    description: [
      "Where expertise becomes a standard, not an exception.",
      "IBPA is a professional, non-profit organization dedicated to elevating the beauty industry into a globally respected field — one built on expertise, ethics, and uncompromising quality.",
      "We believe that beauty is not just an aesthetic craft, but a profession that deserves recognition on par with any other field of expertise. Our mission is to strengthen that recognition — advocating for the standards, integrity, and professional excellence that define the industry’s finest.",
      "Membership with IBPA is more than affiliation. It’s a statement of credibility — designed to enhance your professional reputation, increase your visibility within the industry, and connect you to a global community of beauty professionals who share the same commitment to excellence.",
    ],
  },
  {
    id: "andreeva-consulting",
    name: "Andreeva Consulting Inc",
    logo: "/images/sponsors/andreeva-consulting.png",
    description: [
      "Andreeva Consulting is a consulting firm that helps beauty industry professionals legally establish and grow their careers in the United States. The company guides clients through the process of obtaining professional beauty licenses, helping them navigate licensing requirements and prepare the necessary documentation.",
      "Andreeva Consulting also provides support throughout the visa process for professionals with extraordinary achievements in their field, helping them prepare and structure the materials required for immigration and legal status in the U.S.",
    ],
  },
  {
    id: "nepop-radio",
    name: "NePop Radio",
    logo: "/images/sponsors/nepop-media.png",
    description: [
      "There’s an old internet joke: “Here’s my unpopular but professional opinion — and I’m out.” It’s funny because it’s true. The people who actually move industries forward are rarely the ones chasing consensus. They’re the ones willing to say the uncomfortable thing, defend the unfashionable idea, and let the results speak once everyone else catches up.",
      "That’s where the name comes from. NePOP — not pop, not mainstream, not here to blend in.",
      "We built NePOP media for professionals who left everything familiar behind and chose to keep moving forward anyway — immigrants who rebuilt their careers, their credibility, and sometimes their entire identity from the ground up in a new country. People who understand that fitting in was never really the goal. Doing exceptional work was.",
      "Across our radio station, our YouTube channel, and our growing lineup of magazines, NePOP media brings that same spirit to every format: real conversations, unfiltered perspectives, and the kind of professional insight that doesn’t try to please everyone — because the ones who matter don’t need convincing.",
      "One voice. Every platform. Built for the professionals who’d rather be first than fashionable.",
    ],
  },
];
