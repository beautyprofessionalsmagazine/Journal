"use client";

import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type ChangeEvent, useCallback, useEffect, useId, useRef } from "react";

import { ArticleTiptapToolbar } from "@/features/articles/components/ArticleTiptapToolbar";
import { ArticleImage } from "@/features/articles/editor/article-image-extension";
import { ArticleImagePlaceholder } from "@/features/articles/editor/article-image-placeholder";
import { getSupportedImageFiles } from "@/features/articles/editor/article-image-upload";
import {
  useArticleImageUpload,
  type ArticleImageUploadState,
} from "@/features/articles/editor/use-article-image-upload";
import type { TiptapDocument } from "@/features/articles/types/article";
import {
  ALLOWED_ARTICLE_IMAGE_TYPES,
  isSafeEditorLinkHref,
} from "@/features/articles/validation/article-validation";

const IMAGE_PICKER_ACCEPT = ALLOWED_ARTICLE_IMAGE_TYPES.join(",");

type ArticleTiptapEditorProps = {
  value: TiptapDocument;
  onChange: (value: TiptapDocument) => void;
  onBlur?: () => void;
  error?: string;
  /** Names uploaded body images after the article they belong to. */
  slug?: string;
  onImageUploadStateChange?: (state: ArticleImageUploadState) => void;
};

export function ArticleTiptapEditor({
  value,
  onChange,
  onBlur,
  error,
  slug = "",
  onImageUploadStateChange,
}: ArticleTiptapEditorProps) {
  const descriptionId = useId();
  const errorId = useId();
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const lastEmittedDocumentRef = useRef("");
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const imagePickerPositionRef = useRef<number | null>(null);
  // editorProps are captured once, so drop and paste reach the upload handler
  // through a ref that stays current as the hook re-renders.
  const uploadImageFilesRef = useRef<
    ((files: File[], position?: number | null) => void) | null
  >(null);

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
      ArticleImage,
      ArticleImagePlaceholder,
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
      handleDrop: (view, event, _slice, moved) => {
        // Dragging an existing node inside the editor is TipTap's job.
        if (moved) {
          return false;
        }

        const files = getSupportedImageFiles(event.dataTransfer?.files);

        if (!files.length) {
          return false;
        }

        event.preventDefault();
        const dropPosition = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;
        uploadImageFilesRef.current?.(files, dropPosition ?? null);

        return true;
      },
      handlePaste: (_view, event) => {
        const files = getSupportedImageFiles(event.clipboardData?.files);

        if (!files.length) {
          return false;
        }

        event.preventDefault();
        uploadImageFilesRef.current?.(files, null);

        return true;
      },
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

  const imageUpload = useArticleImageUpload({
    editor,
    onStateChange: onImageUploadStateChange,
    slug,
  });
  const { uploadFiles } = imageUpload;

  useEffect(() => {
    uploadImageFilesRef.current = (files, position) => {
      void uploadFiles(files, position);
    };
  }, [uploadFiles]);

  // The caret is captured on click, before the file dialog takes focus, so the
  // image lands where the writer left off rather than at the end of the story.
  const openImagePicker = useCallback(() => {
    imagePickerPositionRef.current = editor?.state.selection.from ?? null;
    imagePickerRef.current?.click();
  }, [editor]);

  function handleImagePickerChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length) {
      void uploadFiles(files, imagePickerPositionRef.current);
    }

    imagePickerPositionRef.current = null;
  }

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
        className={`article-editor border bg-white transition focus-within:border-black ${
          error ? "border-red-700" : "border-black/15"
        }`}
      >
        <input
          accept={IMAGE_PICKER_ACCEPT}
          className="sr-only"
          multiple
          onChange={handleImagePickerChange}
          ref={imagePickerRef}
          tabIndex={-1}
          type="file"
        />
        <ArticleTiptapToolbar
          editor={editor}
          imageUploadError={imageUpload.error}
          isUploadingImage={imageUpload.isUploading}
          onDismissImageUploadError={imageUpload.clearError}
          onInsertImage={openImagePicker}
        />
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
