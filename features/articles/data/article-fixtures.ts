import type {
  Article,
  ArticleStatus,
  TiptapDocument,
  TiptapNode,
} from "@/features/articles/types/article";

/**
 * Development-only editorial fixtures.
 *
 * These records are rendered in `next dev` so public layouts can be reviewed
 * without seeding a database. They are never inserted and production queries
 * always use Drizzle. Set USE_DATABASE_ARTICLES=true to use local database
 * records while developing.
 */
export const developmentArticleFixtures: Article[] = [
  fixture({
    id: 1,
    title: "The Quiet Architecture of a Great Haircut",
    slug: "quiet-architecture-of-a-great-haircut",
    category: "Beauty",
    author: "Mara Ellison",
    description:
      "Inside a precision-cutting studio where restraint, consultation, and the patient work of observation matter more than spectacle.",
    coverImage: image("photo-1562322140-8baeececf3df"),
    coverImageAlt:
      "Stylist shaping a client’s dark bob in a light-filled salon",
    tags: ["Hair", "Profiles", "Technique"],
    views: 18420,
    daysAgo: 1,
    featured: true,
    sections: [
      {
        heading: "A cut begins before the chair",
        paragraphs: [
          "The first ten minutes are almost silent. The stylist watches how the hair falls, where the client touches it, and which gestures are habit rather than preference.",
          "That attention creates a cut that works after the salon finish has gone. It is less about imposing a shape than discovering the structure already present.",
        ],
      },
      {
        heading: "Precision without rigidity",
        paragraphs: [
          "Technical control matters, but the best work leaves room for weather, movement, and the imperfect routines of real mornings.",
        ],
      },
    ],
    quote:
      "A beautiful haircut should feel considered on day one and completely natural by day thirty.",
  }),
  fixture({
    id: 2,
    title: "The Red Lip",
    slug: "the-red-lip",
    category: "Beauty",
    author: "Naomi Price",
    description: "Five working artists reconsider a beauty classic.",
    coverImage: image("photo-1522335789203-aabd1fc54bc9"),
    coverImageAlt:
      "Makeup artist arranging red pigments and brushes on a worktable",
    tags: ["Makeup"],
    views: 9620,
    daysAgo: 2,
    sections: [
      {
        heading: "One color, many decisions",
        paragraphs: [
          "Red is never simply red. Undertone, edge, texture, and the color already present in the face change the result completely.",
        ],
      },
    ],
    quote: "The confidence comes from the wearer, not the tube.",
  }),
  fixture({
    id: 3,
    title:
      "What Happens Backstage Before the First Look Appears—and Why the Smallest Decisions Shape an Entire Runway",
    slug: "what-happens-backstage-before-the-first-look",
    category: "Runway",
    author: "Elena Park",
    description:
      "A minute-by-minute account of the invisible choreography behind a runway beauty look, from the first call sheet to the final pin placed seconds before showtime.",
    coverImage: image("photo-1529139574466-a303027c1d8b"),
    coverImageAlt:
      "Model waiting backstage while artists prepare the runway look",
    tags: ["Backstage", "Hair", "Makeup", "Fashion Week"],
    views: 14790,
    daysAgo: 3,
    sections: [
      {
        heading: "The call time",
        paragraphs: [
          "Four hours before the room fills, the backstage area already has its own weather: warm lights, cool metal tables, and the low rhythm of kit cases opening.",
          "The key artists translate a reference into repeatable gestures. Every choice must survive different faces, hair textures, lighting conditions, and a schedule measured in seconds.",
        ],
      },
      {
        heading: "A system built for change",
        paragraphs: [
          "Nothing is precious. A lip can disappear after rehearsal; a sculptural parting can soften when the collection calls for less control. The team’s real craft is adaptation.",
          "Assistants keep continuity photographs and short notes so that a last-minute decision can travel through forty working stations without losing its intent.",
        ],
      },
      {
        heading: "The final minute",
        paragraphs: [
          "At lineup, the work becomes almost invisible: powder at the hairline, a loose thread removed, a final check under the show light.",
        ],
      },
    ],
    quote:
      "Backstage excellence is not calm because nothing changes. It is calm because the team knows how to change together.",
  }),
  fixture({
    id: 4,
    title: "A Wardrobe That Works as Hard as You Do",
    slug: "wardrobe-that-works-as-hard-as-you-do",
    category: "Shopping",
    author: "Simone Bell",
    description:
      "Hard-wearing black layers, considered shoes, and studio essentials selected for long days without losing personal style.",
    coverImage: image("photo-1483985988355-763728e1935b"),
    coverImageAlt:
      "A considered rail of neutral workwear in a fashion studio",
    tags: ["Workwear", "Editors’ Picks"],
    views: 7340,
    daysAgo: 4,
    sections: [
      {
        heading: "Start with movement",
        paragraphs: [
          "A useful studio wardrobe bends, washes well, and carries the tools a working day actually requires.",
        ],
      },
      {
        heading: "Buy fewer, better layers",
        paragraphs: [
          "Fabric recovery and thoughtful pockets matter more than novelty. A strong uniform should remove decisions, not personality.",
        ],
      },
    ],
  }),
  fixture({
    id: 5,
    title: "The New Salon Is a Cultural Space",
    slug: "new-salon-is-a-cultural-space",
    category: "Culture",
    author: "Dalia Noor",
    description:
      "Book clubs, small exhibitions, listening sessions, and community tables are changing what a neighborhood salon can hold.",
    coverImage: image("photo-1441986300917-64674bd600d8"),
    coverImageAlt:
      "Guests gathering around a long table in a bright creative space",
    tags: ["Opinion", "Community", "Arts"],
    views: 12110,
    daysAgo: 5,
    sections: [
      {
        heading: "Beyond the appointment",
        paragraphs: [
          "The salon has always been a place where private life meets public conversation. A new generation of owners is making that social role explicit.",
          "Programming is intentionally modest: one shelf of independent books, a monthly artist wall, or a long table that stays after closing.",
        ],
      },
      {
        heading: "Hospitality as editorial practice",
        paragraphs: [
          "Choosing what enters the room—and who is invited to speak—is a form of cultural editing with immediate, local consequences.",
        ],
      },
    ],
    quote: "A room becomes a community when people have a reason to return.",
  }),
  fixture({
    id: 6,
    title: "A Working Weekend in Copenhagen",
    slug: "working-weekend-in-copenhagen",
    category: "Living",
    author: "June Okafor",
    description:
      "An unhurried professional itinerary for good light, thoughtful retail, restorative meals, and design references worth bringing home.",
    coverImage: image("photo-1490481651871-ab68de25d43d"),
    coverImageAlt:
      "A pedestrian in a tailored coat walking through a European street",
    tags: ["Travel", "City Guide"],
    views: 6810,
    daysAgo: 6,
    sections: [
      {
        heading: "Friday: look closely",
        paragraphs: [
          "Begin with materials rather than landmarks: ceramic surfaces, old shop lettering, and the proportions of rooms designed to hold winter light.",
        ],
      },
      {
        heading: "Saturday: leave space",
        paragraphs: [
          "A useful research trip needs unplanned hours. The strongest reference may be a color seen from a bus rather than something saved to a list.",
        ],
      },
    ],
  }),
  fixture({
    id: 7,
    title: "Skin Barrier, Plainly Explained",
    slug: "skin-barrier-plainly-explained",
    category: "Beauty",
    author: "Dr. Leila March",
    description:
      "A dermatologist separates useful barrier care from expensive noise and offers a routine clients can actually follow.",
    coverImage: image("photo-1570172619644-dfd03ed5d881"),
    coverImageAlt:
      "Close portrait showing natural skin texture in soft daylight",
    tags: ["Skin", "Wellness", "Expert Advice"],
    views: 11340,
    daysAgo: 7,
    sections: [
      {
        heading: "What the barrier does",
        paragraphs: [
          "Think of the outer layer of skin as a selective boundary. It limits water loss while helping keep irritants out.",
        ],
      },
      {
        heading: "A practical reset",
        paragraphs: [
          "Reduce variables, use a gentle cleanser only where needed, moisturize consistently, and introduce active ingredients one at a time.",
        ],
      },
    ],
    quote: "Consistency is more restorative than intensity.",
  }),
  fixture({
    id: 8,
    title: "The Independent Nail Artist’s New Business Model",
    slug: "independent-nail-artists-new-business-model",
    category: "Beauty",
    author: "Priya Santos",
    description:
      "Membership appointments, education, press-on editions, and careful boundaries are helping nail artists build careers beyond a fully booked calendar.",
    coverImage: image("photo-1560066984-138dadb4c035"),
    coverImageAlt:
      "Nail artist applying a precise neutral manicure at a studio table",
    tags: ["Nails", "Business", "Education"],
    views: 8880,
    daysAgo: 8,
    sections: [
      {
        heading: "Capacity is not growth",
        paragraphs: [
          "A full calendar can still be fragile. Independent artists are building revenue that respects the physical limits of service work.",
        ],
      },
      {
        heading: "Teach the signature",
        paragraphs: [
          "Small-group education turns a recognizable technique into durable intellectual property without diluting the client experience.",
        ],
      },
    ],
  }),
  fixture({
    id: 9,
    title: "Street Style After the Algorithm",
    slug: "street-style-after-the-algorithm",
    category: "Fashion",
    author: "Theo Grant",
    description:
      "When every microtrend arrives pre-labeled, the most persuasive personal style looks patient, specific, and difficult to summarize.",
    coverImage: image("photo-1515886657613-9f3515b0c78f"),
    coverImageAlt:
      "Fashion week guest in an expressive layered look on a city street",
    tags: ["Street Style", "Trends", "Opinion"],
    views: 10440,
    daysAgo: 9,
    sections: [
      {
        heading: "The speed of recognition",
        paragraphs: [
          "Platforms reward a look that can be named in half a second. Personal style develops through the opposite process: repetition, revision, and private attachment.",
        ],
      },
      {
        heading: "Keep the difficult pieces",
        paragraphs: [
          "The garments that resist an immediate outfit often become the ones that teach us the most about proportion and taste.",
        ],
      },
    ],
  }),
  fixture({
    id: 10,
    title: "Notes on Casting: Presence Over Perfection",
    slug: "notes-on-casting-presence-over-perfection",
    category: "Fashion",
    author: "Camille Hart",
    description:
      "Three casting directors discuss character, movement, and why an unforgettable walk rarely begins with conventional perfection.",
    coverImage: image("photo-1539109136881-3be0616acf4b"),
    coverImageAlt:
      "Model with a direct gaze photographed against a neutral studio wall",
    tags: ["Models", "Designers"],
    views: 7920,
    daysAgo: 10,
    sections: [
      {
        heading: "Read the room",
        paragraphs: [
          "Casting is a conversation between the clothes, the space, and the person who will animate both.",
        ],
      },
      {
        heading: "Movement tells the truth",
        paragraphs: [
          "A still photograph can suggest possibility. The walk reveals timing, confidence, and the ability to remain distinct inside a larger cast.",
        ],
      },
    ],
  }),
  fixture({
    id: 11,
    title: "Can Fashion Week Become Less Wasteful?",
    slug: "can-fashion-week-become-less-wasteful",
    category: "Fashion",
    author: "Robin Hale",
    description:
      "A practical look at set reuse, local production, sample logistics, and the decisions that can reduce waste without flattening creative ambition.",
    coverImage: null,
    coverImageAlt: null,
    tags: ["Sustainability", "Fashion Week", "News"],
    views: 6350,
    daysAgo: 11,
    sections: [
      {
        heading: "Measure the temporary",
        paragraphs: [
          "The first useful step is treating a one-night set as a supply chain rather than an image. Every surface has an origin and a destination.",
        ],
      },
      {
        heading: "Share infrastructure",
        paragraphs: [
          "Pooled transport and standardized recovery plans are not glamorous, but they reduce the invisible duplication around a show.",
        ],
      },
    ],
  }),
  fixture({
    id: 12,
    title: "The Beauty School Reimagined",
    slug: "beauty-school-reimagined",
    category: "Culture",
    author: "Avery Stone",
    description:
      "A new education model pairs technical hours with business literacy, visual research, and the confidence to explain creative decisions.",
    coverImage: image("photo-1487412912498-0447578fcca8"),
    coverImageAlt:
      "Beauty students observing a demonstration in a modern classroom",
    tags: ["Education", "Books", "Business"],
    views: 5480,
    daysAgo: 12,
    sections: [
      {
        heading: "Technique is the beginning",
        paragraphs: [
          "Students need repetition at the hand and language at the table. Being able to describe a decision makes collaboration more precise.",
        ],
      },
      {
        heading: "Teach the whole career",
        paragraphs: [
          "Pricing, contracts, image rights, and health all belong beside cutting, color, and product knowledge.",
        ],
      },
    ],
  }),
  fixture({
    id: 13,
    title: "Objects for a Calmer Workstation",
    slug: "objects-for-a-calmer-workstation",
    category: "Shopping",
    author: "BPM Market Desk",
    description:
      "Nine quiet upgrades for clearer surfaces, faster resets, and a kit that is easier to understand at a glance.",
    coverImage: image("photo-1525507119028-ed4c629a60a3"),
    coverImageAlt:
      "Minimal studio workstation with neatly arranged tools and textiles",
    tags: [],
    views: 4320,
    daysAgo: 13,
    sections: [
      {
        heading: "Edit before organizing",
        paragraphs: [
          "Storage cannot solve an excess of duplicate products. Begin by removing what is expired, unreliable, or never used.",
        ],
      },
      {
        heading: "Make reset visible",
        paragraphs: [
          "A tray for every stage of service makes cleanup faster and helps assistants understand the room without explanation.",
        ],
      },
    ],
  }),
  fixture({
    id: 14,
    title: "Home as a Creative Reference Library",
    slug: "home-as-a-creative-reference-library",
    category: "Living",
    author: "Nina Cho",
    description:
      "Four artists on arranging books, textiles, photographs, and found objects so that domestic space continues to feed professional imagination.",
    coverImage: null,
    coverImageAlt: null,
    tags: ["Homes", "Arts", "Interiors"],
    views: 3910,
    daysAgo: 14,
    sections: [
      {
        heading: "References need friction",
        paragraphs: [
          "A useful library is not perfectly styled. It lets unlikely objects sit close enough to create a new idea.",
        ],
      },
      {
        heading: "Leave some things out",
        paragraphs: [
          "Visible materials invite return. Rotating a small group of books and images can make familiar work newly legible.",
        ],
      },
    ],
  }),
  fixture({
    id: 15,
    title: "Soundcheck",
    slug: "soundcheck",
    category: "Culture",
    author: "Miles Rowan",
    description:
      "A short conversation about stage makeup, sweat, and the visual discipline behind a touring musician’s five-minute change.",
    coverImage: image("photo-1501386761578-eac5c94b800a"),
    coverImageAlt:
      "Musician silhouetted in stage light during a live soundcheck",
    tags: ["Music"],
    views: 2870,
    daysAgo: 15,
    sections: [
      {
        heading: "Built for the stage",
        paragraphs: [
          "The look must read from the back row, survive heat, and still feel like the person wearing it.",
        ],
      },
    ],
  }),
  fixture({
    id: 16,
    title: "The Soft-Focus Makeup Test",
    slug: "soft-focus-makeup-test",
    category: "Runway",
    author: "Elena Park",
    description:
      "Draft notes from an early runway test exploring powdered color, reflective skin, and a deliberately unfinished eye.",
    coverImage: null,
    coverImageAlt: null,
    tags: ["Backstage", "Makeup"],
    views: 0,
    daysAgo: 1,
    status: "draft",
    sections: [
      {
        heading: "Test notes",
        paragraphs: [
          "Check the finish under show lighting and photograph every variation before choosing the final density.",
        ],
      },
    ],
  }),
  fixture({
    id: 17,
    title: "A Conversation with the New Guard of Independent Beauty Founders",
    slug: "conversation-new-guard-independent-beauty-founders",
    category: "Beauty",
    author: "Iris Vaughn",
    description:
      "An extended roundtable on patient growth, responsible claims, retailer pressure, and the value of building a smaller company on purpose.",
    coverImage: image("photo-1596462502278-27bfdc403348"),
    coverImageAlt:
      "Independent beauty founders reviewing products around a studio table",
    tags: ["Celebrity Beauty", "Business", "Profiles", "Skin", "Makeup"],
    views: 0,
    daysAgo: 2,
    status: "draft",
    sections: [
      {
        heading: "What scale should mean",
        paragraphs: [
          "Growth is useful only when quality, cash flow, and the founder’s ability to make thoughtful decisions can grow with it.",
        ],
      },
      {
        heading: "Claims require patience",
        paragraphs: [
          "The founders describe testing as both an ethical obligation and a way to resist the frantic cadence of product launches.",
        ],
      },
    ],
  }),
  fixture({
    id: 18,
    title: "The Next Issue: An Editor’s Working Note",
    slug: "next-issue-editors-working-note",
    category: "Culture",
    author: "Editorial Desk",
    description:
      "A draft commissioning note about the people, rituals, and practical intelligence that will shape the magazine’s next issue.",
    coverImage: null,
    coverImageAlt: null,
    tags: ["Opinion", "News"],
    views: 0,
    daysAgo: 3,
    status: "draft",
    sections: [
      {
        heading: "The question",
        paragraphs: [
          "How does beauty work create belonging—and what does the industry owe the communities that make its images possible?",
        ],
      },
    ],
  }),
];

type FixtureInput = {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  description: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  tags: string[];
  views: number;
  daysAgo: number;
  status?: ArticleStatus;
  featured?: boolean;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  quote?: string;
};

function fixture(input: FixtureInput): Article {
  const publishedAt = new Date(
    Date.UTC(2026, 6, Math.max(1, 30 - input.daysAgo), 16, 0),
  );
  const createdAt = new Date(publishedAt.getTime() - 3 * 86_400_000);

  return {
    id: `00000000-0000-4000-8000-${String(input.id).padStart(12, "0")}`,
    title: input.title,
    slug: input.slug,
    category: input.category,
    author: input.author,
    description: input.description,
    coverImage: input.coverImage,
    coverImageAlt: input.coverImageAlt,
    tags: input.tags,
    status: input.status ?? "published",
    publishedAt: input.status === "draft" ? null : publishedAt,
    views: input.views,
    contentJson: articleDocument(input),
    createdAt,
    updatedAt: publishedAt,
    featured: input.featured,
  };
}

function articleDocument(input: FixtureInput): TiptapDocument {
  const content: TiptapNode[] = [
    paragraph([
      text(input.description, [{ type: "italic" }]),
      { type: "hardBreak" },
      text(
        "Reporting and interviews have been condensed into this development fixture to test the complete editorial renderer.",
      ),
    ]),
  ];

  input.sections.forEach((section, sectionIndex) => {
    content.push({
      type: "heading",
      attrs: { level: sectionIndex === 0 ? 2 : 3 },
      content: [text(section.heading)],
    });
    section.paragraphs.forEach((value, paragraphIndex) => {
      const paragraphContent =
        paragraphIndex === 0
          ? [
              text(value.split(" ").slice(0, 4).join(" ") + " ", [
                { type: "bold" },
              ]),
              text(value.split(" ").slice(4).join(" ")),
            ]
          : [text(value)];
      content.push(paragraph(paragraphContent));
    });
  });

  if (input.quote) {
    content.push({
      type: "blockquote",
      content: [paragraph([text(input.quote)])],
    });
  }

  content.push(
    {
      type: "heading",
      attrs: { level: 3 },
      content: [text("Field notes")],
    },
    {
      type: "bulletList",
      content: [
        listItem("Observe the work in its real environment."),
        listItem("Ask what must remain useful after the image is made."),
        listItem("Record the small decisions that rarely reach a caption."),
      ],
    },
    {
      type: "orderedList",
      content: [
        listItem("Begin with context."),
        listItem("Test the technique."),
        listItem("Edit for clarity."),
      ],
    },
    paragraph([
      text("Explore more reporting in the "),
      text("Journal archive", [
        {
          type: "link",
          attrs: {
            href: "/archive",
            target: null,
            rel: null,
            class: null,
          },
        },
      ]),
      text("."),
    ]),
  );

  return { type: "doc", content };
}

function paragraph(content: TiptapNode[]): TiptapNode {
  return { type: "paragraph", content };
}

function listItem(value: string): TiptapNode {
  return {
    type: "listItem",
    content: [paragraph([text(value)])],
  };
}

function text(
  value: string,
  marks?: NonNullable<TiptapNode["marks"]>,
): TiptapNode {
  return {
    type: "text",
    text: value,
    ...(marks ? { marks } : {}),
  };
}

function image(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=82`;
}
