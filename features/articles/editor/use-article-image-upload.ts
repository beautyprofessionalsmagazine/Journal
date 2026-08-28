"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  addArticleImagePlaceholder,
  findArticleImagePlaceholder,
  removeArticleImagePlaceholder,
} from "@/features/articles/editor/article-image-placeholder";
import { uploadArticleBodyImage } from "@/features/articles/editor/article-image-upload";
import { toUploadErrorMessage } from "@/features/articles/lib/article-image-files";

export type ArticleImageUploadState = {
  error: string | null;
  isUploading: boolean;
};

type UseArticleImageUploadOptions = {
  editor: Editor | null;
  slug: string;
  onStateChange?: (state: ArticleImageUploadState) => void;
};

let placeholderCounter = 0;

/*
 * Orchestrates every inline image insertion: drop a placeholder at the caret,
 * upload, then replace the placeholder with a real image node at whatever
 * position it has mapped to. Files are handled one at a time so a multi-file
 * drop keeps its order.
 */
export function useArticleImageUpload({
  editor,
  slug,
  onStateChange,
}: UseArticleImageUploadOptions) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const slugRef = useRef(slug);
  const onStateChangeRef = useRef(onStateChange);
  const controllersRef = useRef(new Set<AbortController>());

  useEffect(() => {
    slugRef.current = slug;
    onStateChangeRef.current = onStateChange;
  }, [onStateChange, slug]);

  const isUploading = uploadingCount > 0;

  useEffect(() => {
    onStateChangeRef.current?.({ error, isUploading });
  }, [error, isUploading]);

  useEffect(() => {
    const controllers = controllersRef.current;

    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadFiles = useCallback(
    async (files: File[], position?: number | null) => {
      if (!editor || !files.length) {
        return;
      }

      setError(null);

      for (const [index, file] of files.entries()) {
        // Only the first file uses the requested position. Later ones follow the
        // caret, which insertContentAt leaves after the image it just added, so
        // a multi-file drop keeps its order.
        const insertAt =
          index === 0 && position != null
            ? position
            : editor.state.selection.from;

        // Sequential on purpose: each image has to land before the next one
        // reads the caret position.
        await uploadOne(file, insertAt);
      }

      async function uploadOne(file: File, insertAt: number) {
        if (!editor || editor.isDestroyed) {
          return;
        }

        placeholderCounter += 1;
        const placeholderId = `article-image-${placeholderCounter}`;
        const controller = new AbortController();
        controllersRef.current.add(controller);
        setUploadingCount((count) => count + 1);

        editor.view.dispatch(
          addArticleImagePlaceholder(editor.state, placeholderId, insertAt),
        );

        try {
          const uploaded = await uploadArticleBodyImage({
            file,
            slug: slugRef.current,
            signal: controller.signal,
          });

          if (editor.isDestroyed) {
            return;
          }

          const placeholderPosition = findArticleImagePlaceholder(
            editor.state,
            placeholderId,
          );

          if (placeholderPosition === null) {
            // The writer deleted the region the placeholder was holding, so
            // there is no longer a meaningful spot to drop the image into.
            setError(
              "That part of the article changed while the image uploaded, so it wasn't inserted. Try again.",
            );
            return;
          }

          // Clear the placeholder before inserting so the writer never sees
          // the spinner and the finished image at the same time.
          editor.view.dispatch(
            removeArticleImagePlaceholder(editor.state, placeholderId),
          );

          editor
            .chain()
            .focus()
            .insertContentAt(placeholderPosition, {
              type: "image",
              attrs: {
                src: uploaded.src,
                alt: "",
                title: null,
                align: "center",
                width: uploaded.width,
                height: uploaded.height,
              },
            })
            .run();
        } catch (caughtError) {
          if (controller.signal.aborted || editor.isDestroyed) {
            return;
          }

          setError(
            toUploadErrorMessage(
              caughtError,
              "Image upload failed. Please try again.",
            ),
          );
        } finally {
          controllersRef.current.delete(controller);
          setUploadingCount((count) => Math.max(0, count - 1));

          if (!editor.isDestroyed) {
            editor.view.dispatch(
              removeArticleImagePlaceholder(editor.state, placeholderId),
            );
          }
        }
      }
    },
    [editor],
  );

  return {
    clearError,
    error,
    isUploading,
    uploadFiles,
  };
}
