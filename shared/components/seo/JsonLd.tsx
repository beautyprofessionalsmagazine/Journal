import { serializeJsonLd } from "@/shared/seo/json-ld";

type JsonLdProps = {
  /** A JSON-LD object, usually `jsonLdGraph([...nodes])`. */
  data: object;
};

/**
 * Renders structured data as an inline JSON-LD script. Server component: the
 * markup ships in the initial HTML, where every crawler can read it without
 * running JavaScript. A plain <script> is used on purpose (next/script is for
 * executable code); `serializeJsonLd` makes the payload safe to inline.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
