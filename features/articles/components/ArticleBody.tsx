import type { ArticleBodyBlock } from "@/features/articles/types/article.types";

type ArticleBodyProps = {
  blocks: ArticleBodyBlock[];
};

export function ArticleBody({ blocks }: ArticleBodyProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-7">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return (
            <h2
              className="border-t border-black pt-8 [font-family:var(--font-editorial-sans)] text-sm font-bold uppercase text-black"
              key={key}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "question") {
          return (
            <p
              className="[font-family:var(--font-editorial-sans)] text-lg font-semibold leading-8 text-black"
              key={key}
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "answer") {
          return (
            <p
              className="[font-family:var(--font-editorial-body-serif)] text-xl leading-9 text-black/82"
              key={key}
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "pullQuote") {
          return (
            <blockquote
              className="my-5 border-y border-black py-8 [font-family:var(--font-editorial-title)] text-3xl font-bold leading-tight text-black sm:text-4xl"
              key={key}
            >
              {block.text}
            </blockquote>
          );
        }

        return (
          <p
            className="[font-family:var(--font-editorial-body-serif)] text-xl leading-9 text-black/82"
            key={key}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
