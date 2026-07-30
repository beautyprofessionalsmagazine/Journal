import { Fragment, type CSSProperties, type ReactNode } from "react";

import type { TiptapDocument, TiptapMark, TiptapNode } from "@/features/articles/types/article";

type ArticleBodyProps = {
  content?: TiptapDocument | null;
};

export function ArticleBody({ content }: ArticleBodyProps) {
  if (content?.type !== "doc") {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-7">
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
          className="[font-family:var(--font-editorial-body-serif)] text-xl leading-9 text-black/82"
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
          ? "border-t border-black pt-8 [font-family:var(--font-editorial-title)] text-4xl font-bold leading-tight text-black"
          : "[font-family:var(--font-editorial-title)] text-3xl font-bold leading-tight text-black";

      return (
        <HeadingTag className={headingClassName} key={key} style={style}>
          {content}
        </HeadingTag>
      );
    }
    case "bulletList":
      return (
        <ul
          className="list-disc pl-6 [font-family:var(--font-editorial-body-serif)] text-xl leading-9 text-black/82"
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
          className="list-decimal pl-6 [font-family:var(--font-editorial-body-serif)] text-xl leading-9 text-black/82"
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
          <div className="flex flex-col gap-3">
            {node.content?.map((childNode, index) =>
              renderTiptapNode(childNode, `${key}-item-${index}`),
            )}
          </div>
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          className="my-5 border-y border-black py-8 [font-family:var(--font-editorial-title)] text-3xl font-bold leading-tight text-black sm:text-4xl"
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
      return <hr className="border-black/15" key={key} />;
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
      case "link":
        return (
          <a
            className="underline underline-offset-4"
            href={mark.attrs?.href ?? "#"}
            key={markKey}
            rel={mark.attrs?.rel ?? "noopener noreferrer"}
            target={mark.attrs?.target ?? "_blank"}
          >
            {children}
          </a>
        );
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
