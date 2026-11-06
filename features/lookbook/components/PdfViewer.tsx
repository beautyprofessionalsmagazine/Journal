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
  useSyncExternalStore,
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
  /** Byte size of the PDF; enables page-by-page range loading. */
  fileSize?: number;
};

type PdfReaderLaunchProps = {
  fileName: string;
  src: string;
  title: string;
  fileSize?: number;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "primary" | "secondary" | "outline";
};

type PdfCoverProps = {
  src: string;
  title: string;
  fileSize?: number;
  className?: string;
  eager?: boolean;
};

export function PdfCover({
  src,
  title,
  fileSize,
  className,
  eager = false,
}: PdfCoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const pdfState = usePdfDocument(shouldLoad ? src : null, fileSize);

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
  fileSize,
}: PdfReaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={cn("min-w-0 overflow-hidden border border-black/15", className)}>
        <ReaderExperience
          fileName={fileName}
          fileSize={fileSize}
          key={src}
          onOpenFullScreen={() => setIsOpen(true)}
          src={src}
          title={title}
        />
      </div>
      <ReaderDialog
        fileName={fileName}
        fileSize={fileSize}
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
  fileSize,
  children,
  className,
  size,
  variant = "primary",
}: PdfReaderLaunchProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={className}
        onClick={() => setIsOpen(true)}
        // Start fetching the first pages as soon as the reader is likely.
        onFocus={() => void loadPdfDocument(src, fileSize).catch(() => null)}
        onPointerEnter={() => void loadPdfDocument(src, fileSize).catch(() => null)}
        size={size}
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
        fileSize={fileSize}
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
  fileSize,
  onOpenChange,
  open,
  src,
  title,
}: {
  fileName: string;
  fileSize?: number;
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
      aria-label={`${title} PDF reader`}
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
            fileSize={fileSize}
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
  fileSize,
  src,
  title,
  className,
  isDialog = false,
  onOpenFullScreen,
}: PdfReaderProps & {
  isDialog?: boolean;
  onOpenFullScreen?: () => void;
}) {
  const pdfState = usePdfDocument(src, fileSize);
  // Phones get one legible page at a time; wider screens keep the spread.
  const isSinglePage = useMediaQuery("(max-width: 639px)");
  const pagesPerView = isSinglePage ? 1 : 2;
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const numberOfPages =
    pdfState.status === "ready" ? pdfState.document.numPages : 0;
  const viewStart = isSinglePage ? currentPage : toSpreadStart(currentPage);
  const secondPage =
    !isSinglePage && viewStart + 1 <= numberOfPages ? viewStart + 1 : null;
  const lastViewStart = isSinglePage
    ? Math.max(1, numberOfPages)
    : getMaximumSpreadStart(numberOfPages);
  const isReady = pdfState.status === "ready";

  useEffect(() => {
    if (!isReady || !isDialog) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setCurrentPage(Math.min(lastViewStart, viewStart + pagesPerView));
      } else if (event.key === "ArrowLeft") {
        setCurrentPage(Math.max(1, viewStart - pagesPerView));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDialog, isReady, lastViewStart, pagesPerView, viewStart]);

  return (
    <div
      className={cn(
        "flex min-h-[34rem] flex-col bg-[#242424] text-white",
        isDialog && "min-h-0",
        className,
      )}
    >
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#171717] px-2 py-2 sm:px-4">
        <div className="flex items-center gap-1">
          <ReaderIconButton
            disabled={viewStart <= 1 || !isReady}
            label={isSinglePage ? "Previous page" : "Previous two pages"}
            onClick={() => setCurrentPage(Math.max(1, viewStart - pagesPerView))}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </ReaderIconButton>
          <p
            aria-live="polite"
            className="min-w-[7.5rem] text-center text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/72 sm:min-w-[8.5rem]"
          >
            {isReady
              ? `${secondPage ? "Pages" : "Page"} ${viewStart}${secondPage ? `–${secondPage}` : ""} of ${numberOfPages}`
              : "Preparing pages"}
          </p>
          <ReaderIconButton
            disabled={viewStart >= lastViewStart || !isReady}
            label={isSinglePage ? "Next page" : "Next two pages"}
            onClick={() =>
              setCurrentPage(Math.min(lastViewStart, viewStart + pagesPerView))
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
          <span className="w-11 text-center text-[0.65rem] tabular-nums text-white/58">
            {Math.round(zoom * 100)}%
          </span>
          <ReaderIconButton
            disabled={zoom >= 2}
            label="Zoom in"
            onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
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
            <ReaderIconButton label="Open full-screen reader" onClick={onOpenFullScreen}>
              <Maximize2 aria-hidden="true" size={16} />
            </ReaderIconButton>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
        {isReady ? (
          <div
            className={cn(
              "mx-auto grid min-h-full items-center gap-2 sm:gap-4",
              isSinglePage ? "grid-cols-1" : "grid-cols-2",
            )}
            style={{
              // In full screen, fit the whole spread to the viewport height at 100%.
              width: isDialog
                ? `min(${zoom * 100}%, calc((100dvh - 9.5rem) * ${isSinglePage ? 0.75 : 1.5} * ${zoom}))`
                : `${zoom * 100}%`,
            }}
          >
            <ReaderPage
              document={pdfState.document}
              pageNumber={viewStart}
              title={title}
            />
            {isSinglePage ? null : secondPage ? (
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
          <div
            className={cn(
              "mx-auto grid min-h-[26rem] max-w-5xl items-center gap-3",
              isSinglePage ? "grid-cols-1" : "grid-cols-2",
            )}
            role="status"
          >
            <div className="skeleton-pulse aspect-[3/4] bg-white/10" />
            {isSinglePage ? null : (
              <div className="skeleton-pulse aspect-[3/4] bg-white/10" />
            )}
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
  const [isRendered, setIsRendered] = useState(false);

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
        if (!isCancelled) setIsRendered(true);
      } catch (error) {
        if (!(error instanceof Error) || error.name !== "RenderingCancelledException") {
          throw error;
        }
      }
    }

    renderPage().catch((error: unknown) => {
      if (!isCancelled) console.error("[lookbook] Failed to render PDF page.", error);
    });

    return () => {
      isCancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [document, pageNumber, width]);

  return (
    <div className="relative aspect-[3/4] w-full bg-white" ref={containerRef}>
      {isRendered ? null : (
        <div aria-hidden="true" className="skeleton-pulse absolute inset-0" />
      )}
      <canvas
        aria-label={label}
        className="relative block size-full min-w-0 max-w-full object-contain"
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

function usePdfDocument(src: string | null, fileSize?: number): PdfLoadState {
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

    loadPdfDocument(pdfUrl, fileSize)
      .then((document) => {
        if (isCancelled) return;
        setSnapshot({
          src: pdfUrl,
          state: { status: "ready", document, message: null },
        });
      })
      .catch((error: unknown) => {
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
      });

    return () => {
      isCancelled = true;
    };
  }, [src, fileSize]);

  return src && snapshot.src === src ? snapshot.state : loadingPdfState;
}

/**
 * One shared document per PDF URL for the whole page: the hero cover, the
 * archive cards, and the reader all reuse it instead of each downloading the
 * file again.
 */
const pdfDocumentCache = new Map<string, Promise<PDFDocumentProxy>>();

const RANGE_CHUNK_SIZE = 256 * 1024;
const RANGE_FETCH_ATTEMPTS = 3;

function loadPdfDocument(url: string, fileSize?: number) {
  const cached = pdfDocumentCache.get(url);
  if (cached) return cached;

  const loading = openPdfDocument(url, fileSize);
  pdfDocumentCache.set(url, loading);
  loading.catch(() => pdfDocumentCache.delete(url));

  return loading;
}

async function openPdfDocument(url: string, fileSize?: number) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  // Vercel Blob answers byte ranges but does not expose Accept-Ranges to
  // scripts, so pdf.js's own range detection falls back to downloading the
  // whole (often 40 MB+) file. Feeding it ranges ourselves means a cover
  // needs only the few chunks that hold page one.
  if (fileSize && fileSize > RANGE_CHUNK_SIZE * 2) {
    const initialData = await fetchPdfRange(url, 0, RANGE_CHUNK_SIZE).catch(
      () => null,
    );

    if (initialData) {
      const transport = new pdfjs.PDFDataRangeTransport(fileSize, initialData);

      transport.requestDataRange = (begin: number, end: number) => {
        void fetchPdfRangeWithRetry(url, begin, end).then((chunk) =>
          transport.onDataRange(begin, chunk),
        );
      };

      return pdfjs.getDocument({
        range: transport,
        rangeChunkSize: RANGE_CHUNK_SIZE,
        disableAutoFetch: true,
      }).promise;
    }
  }

  return pdfjs.getDocument({ url }).promise;
}

/** Resolves to the requested bytes, or null when the server ignored the range. */
async function fetchPdfRange(url: string, begin: number, end: number) {
  const response = await fetch(url, {
    headers: { Range: `bytes=${begin}-${end - 1}` },
  });

  if (response.status !== 206) {
    void response.body?.cancel();
    return null;
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function fetchPdfRangeWithRetry(url: string, begin: number, end: number) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < RANGE_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const chunk = await fetchPdfRange(url, begin, end);
      if (chunk) return chunk;
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[lookbook] Failed to load a PDF byte range.", lastError);
  return null;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const loadingPdfState: PdfLoadState = {
  status: "loading",
  document: null,
  message: null,
};

/** Spreads open on odd pages: 1–2, 3–4, … */
function toSpreadStart(page: number) {
  return page % 2 === 0 ? page - 1 : page;
}

function getMaximumSpreadStart(numberOfPages: number) {
  if (numberOfPages <= 2) return 1;
  return numberOfPages % 2 === 0 ? numberOfPages - 1 : numberOfPages;
}

export const pdfCoverStackStyle = {
  "--cover-stack-offset": "clamp(0.55rem, 1.5vw, 1rem)",
} as CSSProperties;
