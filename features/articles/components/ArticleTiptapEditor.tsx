"use client";

import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useRef } from "react";

import { ArticleTiptapToolbar } from "@/features/articles/components/ArticleTiptapToolbar";
import type { TiptapDocument } from "@/features/articles/types/article";
import { isSafeEditorLinkHref } from "@/features/articles/validation/article-validation";

type ArticleTiptapEditorProps = {
  value: TiptapDocument;
  onChange: (value: TiptapDocument) => void;
  onBlur?: () => void;
  error?: string;
};

export function ArticleTiptapEditor({
  value,
  onChange,
  onBlur,
  error,
}: ArticleTiptapEditorProps) {
  const descriptionId = useId();
  const errorId = useId();
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const lastEmittedDocumentRef = useRef("");

  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  }, [onBlur, onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: {
          levels: [2, 3],
        },
        link: {
          autolink: true,
          defaultProtocol: "https",
          isAllowedUri: (url) => isSafeEditorLinkHref(url),
          linkOnPaste: true,
          openOnClick: false,
          protocols: ["http", "https", "mailto"],
        },
      }),
      Placeholder.configure({
        placeholder: "Begin writing your story…",
      }),
      TextAlign.configure({
        alignments: ["left", "center", "right"],
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        "aria-describedby": descriptionId,
        "aria-label": "Article body",
        "aria-multiline": "true",
        class:
          "min-h-[28rem] max-w-full px-5 py-6 outline-none sm:min-h-[34rem] sm:px-8 sm:py-8",
        role: "textbox",
      },
      transformPastedHTML: sanitizePastedHtml,
    },
    onBlur: () => {
      onBlurRef.current?.();
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextDocument = currentEditor.getJSON() as TiptapDocument;
      lastEmittedDocumentRef.current = JSON.stringify(nextDocument);
      onChangeRef.current(nextDocument);
    },
  });

  const editorStats = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return null;
      }

      const text = currentEditor.getText().trim();

      return {
        characters: text.length,
        words: text ? text.split(/\s+/).length : 0,
      };
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextDocument = JSON.stringify(value);

    if (nextDocument === lastEmittedDocumentRef.current) {
      return;
    }

    if (JSON.stringify(editor.getJSON()) !== nextDocument) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.view.dom.setAttribute("aria-invalid", String(Boolean(error)));

    if (error) {
      editor.view.dom.setAttribute(
        "aria-describedby",
        `${descriptionId} ${errorId}`,
      );
    } else {
      editor.view.dom.setAttribute("aria-describedby", descriptionId);
    }
  }, [descriptionId, editor, error, errorId]);

  return (
    <div className="min-w-0">
      <div
        className={`article-editor overflow-hidden border bg-white transition focus-within:border-black ${
          error ? "border-red-700" : "border-black/15"
        }`}
      >
        <ArticleTiptapToolbar editor={editor} />
        <EditorContent editor={editor} />
        <div className="flex items-center justify-between gap-4 border-t border-black/10 bg-[#f8f8f6] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-black/50">
          <span id={descriptionId}>Rich text editor</span>
          <span aria-live="polite">
            {editorStats?.words ?? 0} words · {editorStats?.characters ?? 0}{" "}
            characters
          </span>
        </div>
      </div>
      {error ? (
        <p
          className="mt-2 text-xs text-red-700"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

const allowedPasteElements = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "EM",
  "H2",
  "H3",
  "HR",
  "I",
  "LI",
  "OL",
  "P",
  "S",
  "STRIKE",
  "STRONG",
  "U",
  "UL",
]);

function sanitizePastedHtml(html: string) {
  const parsedDocument = new DOMParser().parseFromString(html, "text/html");

  parsedDocument
    .querySelectorAll(
      "script, style, iframe, object, embed, form, input, button, textarea, select, meta, link",
    )
    .forEach((element) => element.remove());

  Array.from(parsedDocument.body.querySelectorAll("*"))
    .reverse()
    .forEach((element) => {
      if (!allowedPasteElements.has(element.tagName)) {
        element.replaceWith(...Array.from(element.childNodes));
        return;
      }

      const href =
        element.tagName === "A" ? element.getAttribute("href") : null;

      Array.from(element.attributes).forEach((attribute) => {
        element.removeAttribute(attribute.name);
      });

      if (element.tagName === "A" && href && isSafeEditorLinkHref(href)) {
        element.setAttribute("href", href);
        element.setAttribute("rel", "noopener noreferrer");
      }
    });

  return parsedDocument.body.innerHTML;
}
