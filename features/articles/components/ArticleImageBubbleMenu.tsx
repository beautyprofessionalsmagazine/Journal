"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Trash2,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { type MouseEvent, useEffect, useId, useRef, useState } from "react";

import {
  normalizeArticleImageAlign,
  type ArticleImageAlign,
} from "@/features/articles/types/article";
import { Button } from "@/shared/components/ui";

const alignControls: { align: ArticleImageAlign; icon: LucideIcon; label: string }[] =
  [
    { align: "left", icon: AlignLeft, label: "Align image left" },
    { align: "center", icon: AlignCenter, label: "Align image centre" },
    { align: "right", icon: AlignRight, label: "Align image right" },
  ];

type ArticleImageBubbleMenuProps = {
  editor: Editor | null;
};

/*
 * Contextual controls for a selected inline image. Alt text is edited here and
 * nowhere else — it is a separate value from the cover image's alt text.
 *
 * The alt input lives inside the bubble because the bubble menu keeps itself
 * open while focus moves to one of its own children, and ProseMirror holds the
 * image's node selection while the input has focus.
 */
export function ArticleImageBubbleMenu({ editor }: ArticleImageBubbleMenuProps) {
  // Held as the position of the image being edited, so selecting a different
  // image (or clicking away) closes the alt editor without an extra effect.
  const [altEditorPosition, setAltEditorPosition] = useState<number | null>(
    null,
  );
  const [altDraft, setAltDraft] = useState("");
  const altInputRef = useRef<HTMLInputElement>(null);
  const altInputId = useId();

  const imageState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor?.isActive("image")) {
        return null;
      }

      const attributes = currentEditor.getAttributes("image");

      return {
        align: normalizeArticleImageAlign(attributes.align),
        alt: typeof attributes.alt === "string" ? attributes.alt : "",
        position: currentEditor.state.selection.from,
      };
    },
  });

  const isAltEditorOpen =
    imageState !== null && altEditorPosition === imageState.position;

  useEffect(() => {
    if (isAltEditorOpen) {
      altInputRef.current?.focus();
      altInputRef.current?.select();
    }
  }, [isAltEditorOpen]);

  if (!editor) {
    return null;
  }

  function openAltEditor() {
    if (!imageState) {
      return;
    }

    setAltDraft(imageState.alt);
    setAltEditorPosition(imageState.position);
  }

  function applyAlt() {
    editor
      ?.chain()
      .focus()
      .updateAttributes("image", { alt: altDraft.trim() })
      .run();
    closeAltEditor();
  }

  function closeAltEditor() {
    setAltEditorPosition(null);
  }

  function setAlign(align: ArticleImageAlign) {
    editor?.chain().focus().updateAttributes("image", { align }).run();
  }

  function removeImage() {
    closeAltEditor();
    editor?.chain().focus().deleteSelection().run();
  }

  return (
    <BubbleMenu
      className="flex max-w-[min(22rem,calc(100vw-2rem))] flex-col gap-1 border border-black/15 bg-white p-1 shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
      editor={editor}
      options={{ offset: 10, placement: "top" }}
      pluginKey="articleImageBubbleMenu"
      shouldShow={({ editor: currentEditor }) => currentEditor.isActive("image")}
    >
      <div
        aria-label="Image options"
        className="flex items-center gap-1"
        role="toolbar"
      >
        {alignControls.map((control) => (
          <BubbleButton
            active={imageState?.align === control.align}
            icon={control.icon}
            key={control.align}
            label={control.label}
            onClick={() => setAlign(control.align)}
          />
        ))}
        <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-black/15" />
        <BubbleButton
          active={isAltEditorOpen}
          icon={Type}
          label={
            imageState?.alt ? "Edit alt text" : "Add alt text (currently empty)"
          }
          onClick={openAltEditor}
        />
        <BubbleButton
          icon={Trash2}
          label="Remove image"
          onClick={removeImage}
          variant="destructive"
        />
        {!imageState?.alt && !isAltEditorOpen ? (
          <span className="ml-1 shrink-0 pr-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-black/45">
            No alt text
          </span>
        ) : null}
      </div>

      {isAltEditorOpen ? (
        <div className="flex items-center gap-1 border-t border-black/10 pt-1">
          <label className="sr-only" htmlFor={altInputId}>
            Image alt text
          </label>
          <input
            className="min-h-9 w-full min-w-0 border border-black/20 bg-white px-2 text-sm outline-none transition focus:border-black"
            id={altInputId}
            onChange={(event) => setAltDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyAlt();
              } else if (event.key === "Escape") {
                event.preventDefault();
                closeAltEditor();
                editor?.commands.focus();
              }
            }}
            placeholder="Describe the image…"
            ref={altInputRef}
            type="text"
            value={altDraft}
          />
          <BubbleButton
            icon={Check}
            label="Save alt text"
            onClick={applyAlt}
            preserveSelection={false}
          />
          <BubbleButton
            icon={X}
            label="Cancel alt text"
            onClick={() => {
              closeAltEditor();
              editor?.commands.focus();
            }}
            preserveSelection={false}
          />
        </div>
      ) : null}
    </BubbleMenu>
  );
}

type BubbleButtonProps = {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  preserveSelection?: boolean;
  variant?: "destructive";
};

function BubbleButton({
  active,
  icon: Icon,
  label,
  onClick,
  preserveSelection = true,
  variant,
}: BubbleButtonProps) {
  function keepImageSelected(event: MouseEvent<HTMLButtonElement>) {
    if (preserveSelection) {
      event.preventDefault();
    }
  }

  return (
    <Button
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      className={`shrink-0 hover:translate-y-0 ${
        active
          ? "hover:bg-black hover:text-white"
          : "border-transparent hover:border-black/20 hover:bg-white hover:text-black"
      }`}
      onClick={onClick}
      onMouseDown={keepImageSelected}
      size="icon"
      title={label}
      variant={active ? "primary" : variant ?? "icon"}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
    </Button>
  );
}
