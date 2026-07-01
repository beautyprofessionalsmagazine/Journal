import type { Article } from "@/features/articles/types/article.types";

const defaultCoverImage = "/images/journal-bg.PNG";

export const articles: Article[] = [
  {
    id: "article-ibpa-beauty-more-than-nails",
    slug: "beauty-is-more-than-just-doing-nails",
    title: "Beauty Is More Than Just Doing Nails",
    subtitle: "By Valeriia Lizchuk",
    annotation:
      "Iuliia Andreeva, President of the International Beauty Professionals Association - on hollow memberships, the professional community missing in the U.S., and the organization the industry never had.",
    author: "Valeriia Lizchuk",
    publishedAt: "2026-05-31",
    photographer: "Beauty Professional editorial team",
    editorNote:
      "Interview conducted by the Beauty Professional editorial team. The first in-person IBPA International Forum will be held in California in 2026. For details and membership information, visit https://ibpassociations.org",
    category: "Beauty",
    subcategory: "Nails",
    tags: [
      "Beauty",
      "Interview",
      "IBPA",
      "Professional Community",
      "Business",
      "Nails",
    ],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "heading",
        text: "WHO SHE IS",
      },
      {
        type: "paragraph",
        text: "Iuliia Andreeva is the President of the International Beauty Professionals Association, an organization created for beauty professionals who want practical support, stronger professional standards, and a real community around their work.",
      },
      {
        type: "paragraph",
        text: "The conversation begins with a simple idea: beauty work is often treated as a service category, when for many professionals it is also craft, business, emotional labor, continuing education, and a path to independence.",
      },
      {
        type: "question",
        text: "What does Beauty Is More Than Just Doing Nails mean in this conversation?",
      },
      {
        type: "answer",
        text: "Andreeva frames nail work as a profession with layers: technical skill, trust, client care, hygiene, business planning, and peer support. The point is not to romanticize the work, but to recognize the full professional reality behind the appointment.",
      },
      {
        type: "question",
        text: "Why focus on professional community in the United States?",
      },
      {
        type: "answer",
        text: "The interview centers on a gap many beauty professionals feel after training or licensing: they may have credentials, but not a reliable professional circle, shared resources, advocacy, or guidance for the business side of their career.",
      },
      {
        type: "pullQuote",
        text: "A membership only matters when it gives professionals something they can use, return to, and build from.",
      },
      {
        type: "question",
        text: "What makes a membership hollow?",
      },
      {
        type: "answer",
        text: "In the interview, hollow membership is described as affiliation without substance: a logo, a certificate, or a directory listing that does not translate into mentorship, education, connection, standards, or tangible opportunity.",
      },
      {
        type: "question",
        text: "What is IBPA trying to become for the industry?",
      },
      {
        type: "answer",
        text: "IBPA is presented as a professional home for beauty specialists: a place for education, events, cross-border exchange, practical business conversation, and recognition of the people whose work keeps the industry moving.",
      },
      {
        type: "paragraph",
        text: "This first editorial interview establishes the magazine's broader interest in beauty as an industry shaped by skill, migration, entrepreneurship, and community. The story continues with the upcoming IBPA International Forum in California in 2026.",
      },
    ],
    pullQuotes: [
      "A membership only matters when it gives professionals something they can use, return to, and build from.",
    ],
    status: "published",
    featured: true,
    readingCount: 12840,
    createdAt: "2026-05-20T09:00:00.000Z",
    updatedAt: "2026-05-31T09:00:00.000Z",
  },
  {
    id: "article-salon-uniforms-style",
    slug: "salon-uniforms-are-getting-smarter",
    title: "Salon Uniforms Are Getting Smarter",
    subtitle: "A quiet shift in studio style",
    annotation:
      "How beauty teams are rethinking uniforms with comfort, polish, and brand identity in mind.",
    author: "Editorial Desk",
    publishedAt: "2026-06-18",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "Part of our ongoing coverage of practical style inside modern beauty studios.",
    category: "Fashion",
    subcategory: "Trends",
    tags: ["Fashion", "Trends", "Salon", "Workwear"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "Beauty workwear is becoming more intentional: less costume, more uniform system. The best studio wardrobes now balance clean silhouettes, practical materials, and a visual identity clients recognize the moment they enter.",
      },
    ],
    pullQuotes: [],
    status: "published",
    featured: false,
    readingCount: 4210,
    createdAt: "2026-06-12T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
  },
  {
    id: "article-runway-beauty-notes",
    slug: "runway-beauty-notes-for-working-artists",
    title: "Runway Beauty Notes for Working Artists",
    subtitle: "What translates from backstage",
    annotation:
      "A practical reading of runway hair, skin, and makeup ideas for salon professionals.",
    author: "Mira Chen",
    publishedAt: "2026-06-10",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "A trend note designed for professionals adapting editorial ideas to real clients.",
    category: "Runway",
    subcategory: "Backstage",
    tags: ["Runway", "Makeup", "Hair", "Trends"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "Backstage beauty is not a script to copy exactly. It is a set of cues: texture, finish, proportion, and mood. For working artists, the value is knowing what to translate and what to leave on the runway.",
      },
    ],
    pullQuotes: [],
    status: "published",
    featured: false,
    readingCount: 6940,
    createdAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-06-10T10:00:00.000Z",
  },
  {
    id: "article-tools-worth-buying",
    slug: "tools-worth-buying-for-a-small-studio",
    title: "Tools Worth Buying for a Small Studio",
    subtitle: "An editor's shopping list",
    annotation:
      "A lean guide to products and tools that make the workday calmer without overfilling the room.",
    author: "Nadia Orlov",
    publishedAt: "2026-06-08",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "Shopping coverage prioritizes professional usefulness over novelty.",
    category: "Shopping",
    subcategory: "Studio",
    tags: ["Shopping", "Tools", "Business", "Studio"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "The strongest studio purchases are often the quietest ones: storage that resets quickly, lights that flatter without glare, and tools that survive a full week of appointments without drama.",
      },
    ],
    pullQuotes: [],
    status: "published",
    featured: false,
    readingCount: 3550,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    id: "article-skin-barrier-conversation",
    slug: "the-skin-barrier-conversation-keeps-growing",
    title: "The Skin Barrier Conversation Keeps Growing",
    subtitle: "What clients are asking now",
    annotation:
      "A beauty desk note on the language of skin care, client trust, and professional recommendations.",
    author: "Editorial Desk",
    publishedAt: "2026-06-04",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "A short professional note for estheticians and skin care educators.",
    category: "Beauty",
    subcategory: "Skin",
    tags: ["Beauty", "Skin", "Wellness", "Education"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "Clients increasingly arrive with research, routines, and vocabulary. The professional advantage is not having more buzzwords; it is knowing how to translate skin-barrier talk into calm, specific guidance.",
      },
    ],
    pullQuotes: [],
    status: "published",
    featured: false,
    readingCount: 8840,
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-06-04T10:00:00.000Z",
  },
  {
    id: "article-beauty-books-shelf",
    slug: "five-books-for-beauty-business-owners",
    title: "Five Books for Beauty Business Owners",
    subtitle: "Reading beyond the treatment room",
    annotation:
      "A culture shelf for owners thinking about leadership, money, identity, and creative discipline.",
    author: "Lina Park",
    publishedAt: "2026-05-26",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "A culture recommendation list for professional readers.",
    category: "Culture",
    subcategory: "Books",
    tags: ["Culture", "Books", "Business", "Leadership"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "The most useful business books for beauty professionals are rarely only about beauty. They sharpen judgment around systems, communication, pricing, and the kind of attention a small service business requires.",
      },
    ],
    pullQuotes: [],
    status: "published",
    featured: false,
    readingCount: 2760,
    createdAt: "2026-05-19T10:00:00.000Z",
    updatedAt: "2026-05-26T10:00:00.000Z",
  },
  {
    id: "article-traveling-for-training",
    slug: "traveling-for-training-without-burning-out",
    title: "Traveling for Training Without Burning Out",
    subtitle: "A professional living guide",
    annotation:
      "How to plan education trips with better recovery, budgeting, and follow-through.",
    author: "Sofia Martin",
    publishedAt: "2026-05-16",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "Living coverage focuses on the practical life around beauty work.",
    category: "Living",
    subcategory: "Travel",
    tags: ["Living", "Travel", "Education", "Wellness"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "Training travel can be energizing, but the value depends on what happens before and after the class: planning the budget, protecting rest, and making time to practice what was learned.",
      },
    ],
    pullQuotes: [],
    status: "draft",
    featured: false,
    readingCount: 1180,
    createdAt: "2026-05-11T10:00:00.000Z",
    updatedAt: "2026-05-16T10:00:00.000Z",
  },
  {
    id: "article-nail-pricing-draft",
    slug: "what-nail-pricing-needs-to-account-for",
    title: "What Nail Pricing Needs to Account For",
    subtitle: "A draft business explainer",
    annotation:
      "A forthcoming guide to materials, time, experience, location, and the cost of staying educated.",
    author: "Editorial Desk",
    publishedAt: "2026-07-02",
    photographer: "Beauty Professionals Magazine",
    editorNote:
      "Draft pending review by professional contributors.",
    category: "Beauty",
    subcategory: "Nails",
    tags: ["Beauty", "Nails", "Business", "Pricing"],
    coverImage: defaultCoverImage,
    body: [
      {
        type: "paragraph",
        text: "Pricing is never only a number on a menu. It carries material costs, appointment length, education, sanitation, rent, skill, and the professional's ability to keep working sustainably.",
      },
    ],
    pullQuotes: [],
    status: "draft",
    featured: false,
    readingCount: 410,
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-25T10:00:00.000Z",
  },
];
