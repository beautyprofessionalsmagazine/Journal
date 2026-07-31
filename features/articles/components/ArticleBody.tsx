import { Fragment, type CSSProperties, type ReactNode } from "react";

import type { TiptapDocument, TiptapMark, TiptapNode } from "@/features/articles/types/article";

type ArticleBodyProps = {
  content?: TiptapDocument | null;
};

export function ArticleBody({ content }: ArticleBodyProps) {
  if (content?.type !== "doc") {
    return (
      <div className="mx-auto max-w-[54rem] border-y border-black/15 py-10 text-sm leading-7 text-black/58">
        This article body is not available.
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[54rem] min-w-0 flex-col gap-[clamp(1.4rem,3vw,2rem)] [overflow-wrap:anywhere]">
      {content.content.map((node, index) =>
        renderTiptapNode(node, `node-${index}`),
      )}
    </div>
  );
}

function renderTiptapNode(node: TiptapNode, key: string): ReactNode {
  const content = renderInlineContent(node.content);
  const style = getTextAlignStyle(node);

  switch (node.type) {
    case "paragraph":
      return (
        <p
          className="[font-family:var(--font-editorial-body-serif)] text-[clamp(1.12rem,2vw,1.32rem)] leading-[1.78] text-black/82"
          key={key}
          style={style}
        >
          {content}
        </p>
      );
    case "heading": {
      const level = getHeadingLevel(node);
      const HeadingTag = getHeadingTag(level);
      const headingClassName =
        level === 2
          ? "mt-[clamp(2rem,5vw,4rem)] border-t border-black pt-[clamp(1.5rem,4vw,2.5rem)] [font-family:var(--font-editorial-title)] text-[clamp(2.3rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.035em] text-black"
          : "mt-[clamp(1rem,3vw,2rem)] [font-family:var(--font-editorial-title)] text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.025em] text-black";

      return (
        <HeadingTag className={headingClassName} key={key} style={style}>
          {content}
        </HeadingTag>
      );
    }
    case "bulletList":
      return (
        <ul
          className="list-disc space-y-3 pl-6 [font-family:var(--font-editorial-body-serif)] text-[clamp(1.1rem,2vw,1.28rem)] leading-[1.7] text-black/82 marker:text-black"
          key={key}
        >
          {node.content?.map((childNode, index) =>
            renderTiptapNode(childNode, `${key}-bullet-${index}`),
          )}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          className="list-decimal space-y-3 pl-6 [font-family:var(--font-editorial-body-serif)] text-[clamp(1.1rem,2vw,1.28rem)] leading-[1.7] text-black/82 marker:font-semibold marker:text-black"
          key={key}
        >
          {node.content?.map((childNode, index) =>
            renderTiptapNode(childNode, `${key}-ordered-${index}`),
          )}
        </ol>
      );
    case "listItem":
      return (
        <li className="pl-1" key={key}>
          <div className="flex flex-col gap-2 [&_p]:text-[inherit] [&_p]:leading-[inherit]">
            {node.content?.map((childNode, index) =>
              renderTiptapNode(childNode, `${key}-item-${index}`),
            )}
          </div>
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          className="my-[clamp(1.5rem,4vw,3rem)] border-y border-black py-[clamp(2rem,5vw,4rem)] [font-family:var(--font-editorial-title)] text-[clamp(2rem,6vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.035em] text-black [&_p]:text-[inherit] [&_p]:leading-[inherit]"
          key={key}
          style={style}
        >
          <div className="flex flex-col gap-4">
            {node.content?.map((childNode, index) =>
              renderTiptapNode(childNode, `${key}-quote-${index}`),
            )}
          </div>
        </blockquote>
      );
    case "horizontalRule":
      return <hr className="my-4 border-black/20" key={key} />;
    case "text":
      return <Fragment key={key}>{applyMarks(node.text ?? "", node.marks, key)}</Fragment>;
    default:
      return node.content?.length ? (
        <Fragment key={key}>
          {node.content.map((childNode, index) =>
            renderTiptapNode(childNode, `${key}-child-${index}`),
          )}
        </Fragment>
      ) : null;
  }
}

function renderInlineContent(nodes: TiptapNode[] | undefined) {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    if (node.type === "text") {
      return (
        <Fragment key={`inline-${index}`}>
          {applyMarks(node.text ?? "", node.marks, `mark-${index}`)}
        </Fragment>
      );
    }

    if (node.type === "hardBreak") {
      return <br key={`break-${index}`} />;
    }

    return renderTiptapNode(node, `inline-node-${index}`);
  });
}

function applyMarks(text: string, marks: TiptapMark[] | undefined, key: string) {
  return (marks ?? []).reduceRight<ReactNode>((children, mark, index) => {
    const markKey = `${key}-${mark.type}-${index}`;

    switch (mark.type) {
      case "bold":
        return <strong key={markKey}>{children}</strong>;
      case "italic":
        return <em key={markKey}>{children}</em>;
      case "underline":
        return <u key={markKey}>{children}</u>;
      case "strike":
        return <s key={markKey}>{children}</s>;
      case "link": {
        const href = mark.attrs?.href ?? "#";
        const isInternal = href.startsWith("/") || href.startsWith("#");
        return (
          <a
            className="rounded-sm underline decoration-1 underline-offset-4 transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            href={href}
            key={markKey}
            rel={isInternal ? undefined : mark.attrs?.rel ?? "noopener noreferrer"}
            target={isInternal ? undefined : mark.attrs?.target ?? "_blank"}
          >
            {children}
          </a>
        );
      }
      default:
        return <Fragment key={markKey}>{children}</Fragment>;
    }
  }, text);
}

function getHeadingLevel(node: TiptapNode) {
  const level = node.attrs?.level;

  return typeof level === "number" && level >= 1 && level <= 6 ? level : 2;
}

function getHeadingTag(level: number) {
  switch (level) {
    case 1:
      return "h1" as const;
    case 3:
      return "h3" as const;
    case 4:
      return "h4" as const;
    case 5:
      return "h5" as const;
    case 6:
      return "h6" as const;
    default:
      return "h2" as const;
  }
}

function getTextAlignStyle(node: TiptapNode): CSSProperties | undefined {
  const textAlign = node.attrs?.textAlign;

  if (textAlign !== "left" && textAlign !== "center" && textAlign !== "right") {
    return undefined;
  }

  return {
    textAlign,
  };
}
