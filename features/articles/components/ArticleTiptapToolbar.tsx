"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RotateCcw,
  Strikethrough,
  Underline as UnderlineIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { isSafeEditorLinkHref } from "@/features/articles/validation/article-validation";
import { Button } from "@/shared/components/ui";

type ArticleTiptapToolbarProps = {
  editor: Editor | null;
};

export function ArticleTiptapToolbar({
  editor,
}: ArticleTiptapToolbarProps) {
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [linkHref, setLinkHref] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const linkSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const linkInputId = useId();
  const linkErrorId = useId();

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      currentEditor
        ? {
            paragraph: currentEditor.isActive("paragraph"),
            heading2: currentEditor.isActive("heading", { level: 2 }),
            heading3: currentEditor.isActive("heading", { level: 3 }),
            bold: currentEditor.isActive("bold"),
            italic: currentEditor.isActive("italic"),
            underline: currentEditor.isActive("underline"),
            strike: currentEditor.isActive("strike"),
            bulletList: currentEditor.isActive("bulletList"),
            orderedList: currentEditor.isActive("orderedList"),
            blockquote: currentEditor.isActive("blockquote"),
            link: currentEditor.isActive("link"),
            alignLeft: currentEditor.isActive({ textAlign: "left" }),
            alignCenter: currentEditor.isActive({ textAlign: "center" }),
            alignRight: currentEditor.isActive({ textAlign: "right" }),
            canUndo: currentEditor.can().undo(),
            canRedo: currentEditor.can().redo(),
          }
        : null,
  });

  useEffect(() => {
    if (isLinkEditorOpen) {
      linkInputRef.current?.focus();
    }
  }, [isLinkEditorOpen]);

  function openLinkEditor() {
    if (!editor) {
      return;
    }

    const currentHref = editor.getAttributes("link").href;
    const { from, to } = editor.state.selection;
    linkSelectionRef.current = { from, to };
    setLinkHref(typeof currentHref === "string" ? currentHref : "");
    setLinkError(null);
    setIsLinkEditorOpen(true);
  }

  function closeLinkEditor() {
    setIsLinkEditorOpen(false);
    setLinkError(null);
    editor?.commands.focus();
  }

  function applyLink() {
    if (!editor) {
      return;
    }

    const normalizedHref = normalizeLinkHref(linkHref);

    if (!normalizedHref || !isSafeEditorLinkHref(normalizedHref)) {
      setLinkError("Enter a valid web, email, anchor, or internal link.");
      return;
    }

    const linkChain = editor.chain().focus();

    if (linkSelectionRef.current) {
      linkChain.setTextSelection(linkSelectionRef.current);
    }

    linkChain
      .extendMarkRange("link")
      .setLink({
        href: normalizedHref,
        rel: "noopener noreferrer",
        target: normalizedHref.startsWith("/") ? null : "_blank",
      })
      .run();
    linkSelectionRef.current = null;
    setIsLinkEditorOpen(false);
    setLinkError(null);
  }

  function removeLink() {
    if (editor) {
      const linkChain = editor.chain().focus();

      if (linkSelectionRef.current) {
        linkChain.setTextSelection(linkSelectionRef.current);
      }

      linkChain.extendMarkRange("link").unsetLink().run();
    }

    linkSelectionRef.current = null;
    setIsLinkEditorOpen(false);
    setLinkError(null);
  }

  const isDisabled = !editor;

  return (
    <div className="border-b border-black/15 bg-[#f8f8f6] [contain:paint]">
      <div
        aria-label="Article formatting"
        className="flex max-w-full snap-x flex-nowrap items-center gap-1 overflow-x-auto overscroll-x-contain p-2 [scrollbar-color:rgba(0,0,0,0.3)_transparent] [scrollbar-width:thin]"
        role="toolbar"
      >
        <ToolbarButton
          active={toolbarState?.paragraph}
          disabled={isDisabled}
          icon={Pilcrow}
          label="Paragraph"
          onClick={() => editor?.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          active={toolbarState?.heading2}
          disabled={isDisabled}
          icon={Heading2}
          label="Heading 2"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          active={toolbarState?.heading3}
          disabled={isDisabled}
          icon={Heading3}
          label="Heading 3"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <ToolbarDivider />
        <ToolbarButton
          active={toolbarState?.bold}
          disabled={isDisabled}
          icon={Bold}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          shortcut="Control+B"
        />
        <ToolbarButton
          active={toolbarState?.italic}
          disabled={isDisabled}
          icon={Italic}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          shortcut="Control+I"
        />
        <ToolbarButton
          active={toolbarState?.underline}
          disabled={isDisabled}
          icon={UnderlineIcon}
          label="Underline"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          shortcut="Control+U"
        />
        <ToolbarButton
          active={toolbarState?.strike}
          disabled={isDisabled}
          icon={Strikethrough}
          label="Strikethrough"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          active={toolbarState?.bulletList}
          disabled={isDisabled}
          icon={List}
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          active={toolbarState?.orderedList}
          disabled={isDisabled}
          icon={ListOrdered}
          label="Numbered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          active={toolbarState?.blockquote}
          disabled={isDisabled}
          icon={Quote}
          label="Blockquote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          disabled={isDisabled}
          icon={Minus}
          label="Horizontal rule"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
        <ToolbarButton
          active={toolbarState?.link}
          disabled={isDisabled}
          icon={Link2}
          label="Link"
          onClick={openLinkEditor}
        />
        <ToolbarDivider />
        <ToolbarButton
          active={toolbarState?.alignLeft}
          disabled={isDisabled}
          icon={AlignLeft}
          label="Align left"
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          active={toolbarState?.alignCenter}
          disabled={isDisabled}
          icon={AlignCenter}
          label="Align center"
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          active={toolbarState?.alignRight}
          disabled={isDisabled}
          icon={AlignRight}
          label="Align right"
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          disabled={isDisabled}
          icon={Eraser}
          label="Clear formatting"
          onClick={() =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run()
          }
        />
        <ToolbarButton
          disabled={isDisabled || !toolbarState?.canUndo}
          icon={RotateCcw}
          label="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
          shortcut="Control+Z"
        />
        <ToolbarButton
          disabled={isDisabled || !toolbarState?.canRedo}
          icon={Redo2}
          label="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
          shortcut="Control+Shift+Z"
        />
      </div>

      {isLinkEditorOpen ? (
        <div
          className="flex flex-col gap-2 border-t border-black/10 px-3 py-3 sm:flex-row sm:items-start"
        >
          <div className="min-w-0 flex-1">
            <label
              className="sr-only"
              htmlFor={linkInputId}
            >
              Link URL
            </label>
            <input
              aria-describedby={linkError ? linkErrorId : undefined}
              aria-invalid={Boolean(linkError)}
              className="min-h-11 w-full border border-black/20 bg-white px-3 text-sm outline-none transition focus:border-black"
              id={linkInputId}
              onChange={(event) => {
                setLinkHref(event.target.value);
                setLinkError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeLinkEditor();
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
              placeholder="https://example.com"
              ref={linkInputRef}
              type="text"
              value={linkHref}
            />
            {linkError ? (
              <p
                className="mt-1 text-xs text-red-700"
                id={linkErrorId}
                role="alert"
              >
                {linkError}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={applyLink}
            >
              Apply
            </Button>
            {toolbarState?.link ? (
              <Button
                onClick={removeLink}
                variant="secondary"
              >
                Remove
              </Button>
            ) : null}
            <Button
              aria-label="Close link editor"
              onClick={closeLinkEditor}
              variant="icon"
            >
              <X aria-hidden="true" size={16} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  shortcut?: string;
};

function ToolbarButton({
  active,
  disabled = false,
  icon: Icon,
  label,
  onClick,
  shortcut,
}: ToolbarButtonProps) {
  const tooltipId = useId();

  function preserveEditorSelection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  return (
    <Button
      aria-describedby={tooltipId}
      aria-keyshortcuts={shortcut}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      className={`snap-start hover:translate-y-0 ${
        active
          ? "hover:bg-black hover:text-white"
          : "border-transparent hover:border-black/20 hover:bg-white hover:text-black"
      } disabled:border-transparent disabled:bg-transparent disabled:text-black/40`}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={preserveEditorSelection}
      size="icon"
      title={shortcut ? `${label} (${shortcut})` : label}
      variant={active ? "primary" : "icon"}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
      <span className="sr-only" id={tooltipId} role="tooltip">
        {shortcut ? `${label}, ${shortcut}` : label}
      </span>
    </Button>
  );
}

function ToolbarDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 h-6 w-px shrink-0 bg-black/15"
    />
  );
}

function normalizeLinkHref(value: string) {
  const normalizedValue = value.trim();

  if (
    !normalizedValue ||
    normalizedValue.startsWith("/") ||
    normalizedValue.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(normalizedValue)
  ) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
}
