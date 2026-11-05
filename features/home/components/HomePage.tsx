import { HomeDistribution } from "@/features/home/components/HomeDistribution";
import { HomeEditorialLead } from "@/features/home/components/HomeEditorialLead";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import {
  jsonLdGraph,
  organizationNode,
  periodicalNode,
  webPageNode,
  webSiteNode,
} from "@/shared/seo/json-ld";
import { SITE } from "@/shared/seo/site";

const homeJsonLd = jsonLdGraph([
  organizationNode(),
  webSiteNode(),
  periodicalNode(),
  webPageNode({
    path: "/",
    name: SITE.homeTitle,
    description: SITE.description,
  }),
]);

export function HomePage() {
  return (
    <main>
      <JsonLd data={homeJsonLd} />
      {/*
        The home page names the publication in its own <h1>. The cover story
        below is a story heading (<h2>) that changes with every issue, so it
        cannot be the page's one top-level heading.
      */}
      <h1 className="sr-only">{SITE.homeTitle}</h1>
      <HomeEditorialLead />
      <HomeDistribution />
    </main>
  );
}
