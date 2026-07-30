"use client";

import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RotateCcw,
  Underline as UnderlineIcon,
} from "lucide-react";
import { type ComponentType, useEffect } from "react";

import type { TiptapDocument } from "@/features/articles/types/article";

type ArticleTiptapEditorProps = {
  value: TiptapDocument;
  onChange: (value: TiptapDocument) => void;
  error?: string;
};

export function ArticleTiptapEditor({
  value,
  onChange,
  error,
}: ArticleTiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        link: {
          autolink: true,
          linkOnPaste: true,
          openOnClick: false,
        },
      }),
      Placeholder.configure({
        placeholder: "Write the article body...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[26rem] px-6 py-5 [font-family:var(--font-editorial-body-serif)] text-xl leading-9 text-black/82 outline-none",
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.getJSON() as TiptapDocument);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentDocument = JSON.stringify(editor.getJSON());
    const nextDocument = JSON.stringify(value);

    if (currentDocument !== nextDocument) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 border border-black/15 bg-black/[0.02] p-3">
        <ToolbarButton
          active={editor?.isActive("paragraph") ?? false}
          icon={Pilcrow}
          label="Paragraph"
          onClick={() => editor?.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          active={editor?.isActive("heading", { level: 2 }) ?? false}
          icon={Heading2}
          label="Heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          active={editor?.isActive("heading", { level: 3 }) ?? false}
          icon={Heading3}
          label="Heading 3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          active={editor?.isActive("bold") ?? false}
          icon={Bold}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          active={editor?.isActive("italic") ?? false}
          icon={Italic}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          active={editor?.isActive("underline") ?? false}
          icon={UnderlineIcon}
          label="Underline"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          active={editor?.isActive("bulletList") ?? false}
          icon={List}
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          active={editor?.isActive("orderedList") ?? false}
          icon={ListOrdered}
          label="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          active={editor?.isActive("blockquote") ?? false}
          icon={Quote}
          label="Blockquote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          active={editor?.isActive("link") ?? false}
          icon={Link2}
          label="Link"
          onClick={() => handleLinkAction(editor)}
        />
        <ToolbarButton
          active={editor?.isActive({ textAlign: "left" }) ?? false}
          icon={AlignLeft}
          label="Align left"
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          active={editor?.isActive({ textAlign: "center" }) ?? false}
          icon={AlignCenter}
          label="Align center"
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          active={editor?.isActive({ textAlign: "right" }) ?? false}
          icon={AlignRight}
          label="Align right"
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        />
        <ToolbarButton
          disabled={!(editor?.can().undo() ?? false)}
          icon={RotateCcw}
          label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          disabled={!(editor?.can().redo() ?? false)}
          icon={Redo2}
          label="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>
      <div
        className={`article-editor border bg-white ${
          error ? "border-black" : "border-black/15"
        }`}
      >
        <EditorContent editor={editor} />
      </div>
      {error ? (
        <p className="[font-family:var(--font-editorial-body-sans)] text-xs italic text-black/62">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  label: string;
  onClick: () => void;
};

function ToolbarButton({
  active = false,
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className={`inline-flex size-10 items-center justify-center border transition ${
        active
          ? "border-black bg-black text-white"
          : "border-black/15 bg-white text-black hover:border-black"
      } disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/35`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon strokeWidth={1.75} />
    </button>
  );
}

function handleLinkAction(editor: Editor | null) {
  if (!editor) {
    return;
  }

  const currentHref = editor.getAttributes("link").href as string | undefined;
  const nextHref = window.prompt("Enter a link URL", currentHref ?? "https://");

  if (nextHref === null) {
    return;
  }

  if (!nextHref.trim()) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({
      href: nextHref.trim(),
      rel: "noopener noreferrer",
      target: "_blank",
    })
    .run();
}
