import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, type EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/*
 * An upload placeholder that holds the writer's spot while an image uploads.
 *
 * The placeholder is a widget decoration rather than a real node, so it never
 * enters contentJson and never lands in the undo history. Because the decoration
 * set is mapped through every transaction, the writer can keep typing above or
 * below it and the finished image still lands exactly where the cursor was.
 */

type ArticleImagePlaceholderMeta =
  | { type: "add"; id: string; pos: number }
  | { type: "remove"; id: string };

export const articleImagePlaceholderKey =
  new PluginKey<DecorationSet>("articleImagePlaceholder");

export const ArticleImagePlaceholder = Extension.create({
  name: "articleImagePlaceholder",

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: articleImagePlaceholderKey,
        state: {
          init: () => DecorationSet.empty,
          apply(transaction, placeholders) {
            let nextPlaceholders = placeholders.map(
              transaction.mapping,
              transaction.doc,
            );
            const meta = transaction.getMeta(articleImagePlaceholderKey) as
              | ArticleImagePlaceholderMeta
              | undefined;

            if (meta?.type === "add") {
              nextPlaceholders = nextPlaceholders.add(transaction.doc, [
                Decoration.widget(meta.pos, createPlaceholderElement, {
                  id: meta.id,
                }),
              ]);
            }

            if (meta?.type === "remove") {
              nextPlaceholders = nextPlaceholders.remove(
                nextPlaceholders.find(
                  undefined,
                  undefined,
                  (spec) => spec.id === meta.id,
                ),
              );
            }

            return nextPlaceholders;
          },
        },
        props: {
          decorations: (state) => articleImagePlaceholderKey.getState(state),
        },
      }),
    ];
  },
});

export function addArticleImagePlaceholder(
  state: EditorState,
  id: string,
  pos: number,
) {
  return state.tr.setMeta(articleImagePlaceholderKey, {
    type: "add",
    id,
    pos,
  } satisfies ArticleImagePlaceholderMeta);
}

export function removeArticleImagePlaceholder(
  state: EditorState,
  id: string,
) {
  return state.tr.setMeta(articleImagePlaceholderKey, {
    type: "remove",
    id,
  } satisfies ArticleImagePlaceholderMeta);
}

/**
 * Current position of a placeholder, or null once the writer has deleted the
 * region it was holding.
 */
export function findArticleImagePlaceholder(state: EditorState, id: string) {
  const placeholders = articleImagePlaceholderKey.getState(state);
  const match = placeholders?.find(
    undefined,
    undefined,
    (spec) => spec.id === id,
  );

  return match?.length ? match[0].from : null;
}

function createPlaceholderElement() {
  const element = document.createElement("span");
  element.className = "article-editor-image-placeholder";
  element.setAttribute("role", "status");
  element.textContent = "Uploading image…";

  return element;
}
