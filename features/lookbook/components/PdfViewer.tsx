"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type PdfLoadState =
  | { status: "loading"; document: null; message: null }
  | { status: "ready"; document: PDFDocumentProxy; message: null }
  | { status: "error"; document: null; message: string };

type PdfReaderProps = {
  fileName: string;
  src: string;
  title: string;
  className?: string;
};

type PdfReaderLaunchProps = {
  fileName: string;
  src: string;
  title: string;
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

type PdfCoverProps = {
  src: string;
  title: string;
  className?: string;
  eager?: boolean;
};

export function PdfCover({
  src,
  title,
  className,
  eager = false,
}: PdfCoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const pdfState = usePdfDocument(shouldLoad ? src : null);

  useEffect(() => {
    if (shouldLoad || !rootRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      className={cn(
        "relative min-w-0 aspect-[3/4] overflow-hidden bg-[#e7e4dc]",
        className,
      )}
      ref={rootRef}
    >
      {pdfState.status === "ready" ? (
        <PdfPageCanvas
          document={pdfState.document}
          label={`${title} cover`}
          pageNumber={1}
        />
      ) : pdfState.status === "error" ? (
        <PdfFallback message={pdfState.message} title={title} />
      ) : (
        <div
          aria-label={`Loading ${title} cover`}
          className="skeleton-pulse absolute inset-0"
          role="status"
        />
      )}
    </div>
  );
}

export function PdfReader({
  fileName,
  src,
  title,
  className,
}: PdfReaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={cn("min-w-0 overflow-hidden border border-black/15", className)}>
        <ReaderExperience
          fileName={fileName}
          key={src}
          onOpenFullScreen={() => setIsOpen(true)}
          src={src}
          title={title}
        />
      </div>
      <ReaderDialog
        fileName={fileName}
        onOpenChange={setIsOpen}
        open={isOpen}
        src={src}
        title={title}
      />
    </>
  );
}

export function PdfReaderLaunch({
  fileName,
  src,
  title,
  children,
  className,
  variant = "primary",
}: PdfReaderLaunchProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        onClick={() => setIsOpen(true)}
        variant={variant}
      >
        {children ?? (
          <>
            Open reader <BookOpen aria-hidden="true" size={15} />
          </>
        )}
      </Button>
      <ReaderDialog
        fileName={fileName}
        onOpenChange={setIsOpen}
        open={isOpen}
        src={src}
        title={title}
      />
    </>
  );
}

function ReaderDialog({
  fileName,
  onOpenChange,
  open,
  src,
  title,
}: {
  fileName: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  src: string;
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-label={`${title} two-page PDF reader`}
      className="pdf-reader-dialog m-0 h-dvh max-h-none w-screen max-w-none bg-[#151515] p-0 text-white backdrop:bg-black/72"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      ref={dialogRef}
    >
      {open ? (
        <div className="flex h-dvh min-h-0 flex-col">
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/15 bg-black px-3 sm:px-5">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-white/82">
                {title}
              </p>
              <p className="mt-0.5 truncate text-[0.65rem] text-white/45">
                {fileName}
              </p>
            </div>
            <button
              aria-label="Close reader"
              className="focus-ring inline-flex size-10 shrink-0 items-center justify-center border border-white/20 text-white transition-colors hover:border-white hover:bg-white hover:text-black"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <ReaderExperience
            className="min-h-0 flex-1"
            fileName={fileName}
            isDialog
            key={src}
            src={src}
            title={title}
          />
        </div>
      ) : null}
    </dialog>
  );
}

function ReaderExperience({
  fileName,
  src,
  title,
  className,
  isDialog = false,
  onOpenFullScreen,
}: PdfReaderProps & {
  isDialog?: boolean;
  onOpenFullScreen?: () => void;
}) {
  const pdfState = usePdfDocument(src);
  const [spreadStart, setSpreadStart] = useState(1);
  const [zoom, setZoom] = useState(1);
  const numberOfPages =
    pdfState.status === "ready" ? pdfState.document.numPages : 0;
  const secondPage = spreadStart + 1 <= numberOfPages ? spreadStart + 1 : null;
  const maximumSpreadStart = getMaximumSpreadStart(numberOfPages);

  return (
    <div
      className={cn(
        "flex min-h-[34rem] flex-col bg-[#242424] text-white",
        isDialog && "min-h-0",
        className,
      )}
    >
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#171717] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-1">
          <ReaderIconButton
            disabled={spreadStart <= 1 || pdfState.status !== "ready"}
            label="Previous two pages"
            onClick={() => setSpreadStart((page) => Math.max(1, page - 2))}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </ReaderIconButton>
          <p className="min-w-[8.5rem] text-center text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/72">
            {pdfState.status === "ready"
              ? `Pages ${spreadStart}${secondPage ? `–${secondPage}` : ""} of ${numberOfPages}`
              : "Preparing pages"}
          </p>
          <ReaderIconButton
            disabled={
              spreadStart >= maximumSpreadStart || pdfState.status !== "ready"
            }
            label="Next two pages"
            onClick={() =>
              setSpreadStart((page) => Math.min(maximumSpreadStart, page + 2))
            }
          >
            <ChevronRight aria-hidden="true" size={18} />
          </ReaderIconButton>
        </div>

        <div className="flex items-center gap-1">
          <ReaderIconButton
            disabled={zoom <= 0.75}
            label="Zoom out"
            onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}
          >
            <Minus aria-hidden="true" size={16} />
          </ReaderIconButton>
          <span className="w-12 text-center text-[0.65rem] tabular-nums text-white/58">
            {Math.round(zoom * 100)}%
          </span>
          <ReaderIconButton
            disabled={zoom >= 1.5}
            label="Zoom in"
            onClick={() => setZoom((value) => Math.min(1.5, value + 0.25))}
          >
            <Plus aria-hidden="true" size={16} />
          </ReaderIconButton>
          <a
            aria-label={`Download ${fileName}`}
            className="focus-ring inline-flex size-10 items-center justify-center border border-transparent text-white/72 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
            download
            href={src}
          >
            <Download aria-hidden="true" size={16} />
          </a>
          {!isDialog && onOpenFullScreen ? (
            <ReaderIconButton label="Open full-screen two-page reader" onClick={onOpenFullScreen}>
              <Maximize2 aria-hidden="true" size={16} />
            </ReaderIconButton>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
        {pdfState.status === "ready" ? (
          <div
            className="mx-auto grid min-h-full grid-cols-2 items-center gap-2 sm:gap-4"
            style={{ width: `${zoom * 100}%` }}
          >
            <ReaderPage
              document={pdfState.document}
              pageNumber={spreadStart}
              title={title}
            />
            {secondPage ? (
              <ReaderPage
                document={pdfState.document}
                pageNumber={secondPage}
                title={title}
              />
            ) : (
              <div aria-hidden="true" />
            )}
          </div>
        ) : pdfState.status === "error" ? (
          <div className="flex min-h-[26rem] items-center justify-center px-5 text-center">
            <div className="max-w-md">
              <p className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
                The preview could not be opened.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/58">
                {pdfState.message}
              </p>
              <a
                className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 border border-white/35 px-4 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-white hover:text-black"
                href={src}
                rel="noreferrer"
                target="_blank"
              >
                Open original <Download aria-hidden="true" size={15} />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[26rem] grid-cols-2 items-center gap-3" role="status">
            <div className="skeleton-pulse aspect-[3/4] bg-white/10" />
            <div className="skeleton-pulse aspect-[3/4] bg-white/10" />
            <span className="sr-only">Loading {title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ReaderPage({
  document,
  pageNumber,
  title,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
  title: string;
}) {
  return (
    <figure className="min-w-0 self-center">
      <div className="overflow-hidden bg-white shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
        <PdfPageCanvas
          document={document}
          label={`${title}, page ${pageNumber}`}
          pageNumber={pageNumber}
        />
      </div>
      <figcaption className="pt-2 text-center text-[0.62rem] tabular-nums text-white/45">
        {pageNumber}
      </figcaption>
    </figure>
  );
}

function PdfPageCanvas({
  document,
  label,
  pageNumber,
}: {
  document: PDFDocumentProxy;
  label: string;
  pageNumber: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.floor(entry?.contentRect.width ?? 0);
      if (nextWidth > 0) setWidth(nextWidth);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;

    let isCancelled = false;

    async function renderPage() {
      renderTaskRef.current?.cancel();
      const page = await document.getPage(pageNumber);
      if (isCancelled || !canvas) return;

      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = width / unscaledViewport.width;
      const viewport = page.getViewport({ scale });
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) return;

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport,
        transform:
          pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
      });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (error) {
        if (!(error instanceof Error) || error.name !== "RenderingCancelledException") {
          throw error;
        }
      }
    }

    void renderPage();

    return () => {
      isCancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [document, pageNumber, width]);

  return (
    <div className="aspect-[3/4] w-full bg-white" ref={containerRef}>
      <canvas
        aria-label={label}
        className="block size-full min-w-0 max-w-full object-contain"
        ref={canvasRef}
        role="img"
      />
    </div>
  );
}

function ReaderIconButton({
  children,
  disabled = false,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="focus-ring inline-flex size-10 items-center justify-center border border-transparent text-white/72 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white disabled:text-white/22"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PdfFallback({ message, title }: { message: string; title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-5 text-center">
      <div>
        <BookOpen aria-hidden="true" className="mx-auto text-black/24" size={32} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-black/55">
          {title}
        </p>
        <p className="mt-2 text-xs leading-5 text-black/42">{message}</p>
      </div>
    </div>
  );
}

function usePdfDocument(src: string | null): PdfLoadState {
  const [snapshot, setSnapshot] = useState<{
    src: string;
    state: PdfLoadState;
  }>({
    src: "",
    state: loadingPdfState,
  });

  useEffect(() => {
    if (!src) return;

    const pdfUrl = src;
    let isCancelled = false;
    let loadingTask: ReturnType<(typeof import("pdfjs-dist"))["getDocument"]> | null = null;

    async function loadDocument() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        loadingTask = pdfjs.getDocument({ url: pdfUrl });
        const document = await loadingTask.promise;

        if (isCancelled) {
          await loadingTask.destroy();
          return;
        }

        setSnapshot({
          src: pdfUrl,
          state: { status: "ready", document, message: null },
        });
      } catch (error) {
        if (isCancelled) return;

        console.error("[lookbook] Failed to load PDF preview.", error);
        setSnapshot({
          src: pdfUrl,
          state: {
            status: "error",
            document: null,
            message: "Use the original PDF link or try again after refreshing the page.",
          },
        });
      }
    }

    void loadDocument();

    return () => {
      isCancelled = true;
      void loadingTask?.destroy();
    };
  }, [src]);

  return src && snapshot.src === src ? snapshot.state : loadingPdfState;
}

const loadingPdfState: PdfLoadState = {
  status: "loading",
  document: null,
  message: null,
};

function getMaximumSpreadStart(numberOfPages: number) {
  if (numberOfPages <= 2) return 1;
  return numberOfPages % 2 === 0 ? numberOfPages - 1 : numberOfPages;
}

export const pdfCoverStackStyle = {
  "--cover-stack-offset": "clamp(0.55rem, 1.5vw, 1rem)",
} as CSSProperties;
