"use client";

import {
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
} from "lucide-react";
import Cropper, {
  type Area,
} from "react-easy-crop";
import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  COVER_IMAGE_PLACEMENTS,
  createDefaultCoverImageSettings,
  getCoverCrop,
  normalizeCoverImageSettings,
  type CoverCropMetadata,
  type CoverImagePlacement,
  type CoverImagePlacementDefinition,
  type CoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type CoverImageComposerProps = {
  imageUrl: string;
  onApply: (settings: CoverImageSettings) => void;
  onOpenChange: (open: boolean) => void;
  value: CoverImageSettings;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

/**
 * A non-destructive crop desk. The fixed frame and every preview are powered
 * by react-easy-crop; generated files are produced only after the article is
 * saved on the server.
 */
export function CoverImageComposer({
  imageUrl,
  onApply,
  onOpenChange,
  value,
}: CoverImageComposerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [settings, setSettings] = useState(() =>
    normalizeCoverImageSettings(value),
  );
  const [selectedPlacement, setSelectedPlacement] =
    useState<CoverImagePlacement>("homepageFeature");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [cropperRevision, setCropperRevision] = useState(0);

  const selectedDefinition =
    COVER_IMAGE_PLACEMENTS.find(
      (placement) => placement.id === selectedPlacement,
    ) ?? COVER_IMAGE_PLACEMENTS[0];
  const selectedCrop = getCoverCrop(settings, selectedPlacement);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverscroll = document.documentElement.style.overscrollBehavior;

    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    closeButtonRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overscrollBehavior = previousRootOverscroll;
    };
  }, []);

  function close() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    onOpenChange(false);
  }

  function updateSelectedTransform(patch: Partial<CoverCropMetadata>) {
    if (
      (patch.x !== undefined && !Number.isFinite(patch.x)) ||
      (patch.y !== undefined && !Number.isFinite(patch.y)) ||
      (patch.zoom !== undefined && !Number.isFinite(patch.zoom)) ||
      (patch.rotation !== undefined && !Number.isFinite(patch.rotation))
    ) {
      return;
    }

    setSettings((current) => {
      const next = cloneSettings(current);
      next.generatedImages = {};
      next.generationKey = undefined;
      next.crops[selectedPlacement] = {
        ...current.crops[selectedPlacement],
        ...patch,
        aspect: selectedDefinition.aspect,
      };
      return next;
    });
  }

  function saveCropResult(
    placement: CoverImagePlacement,
    croppedArea: Area,
    croppedAreaPixels: Area,
  ) {
    setSettings((current) => {
      const currentCrop = current.crops[placement];

      if (
        areasEqual(currentCrop.croppedArea, croppedArea) &&
        areasEqual(currentCrop.croppedAreaPixels, croppedAreaPixels)
      ) {
        return current;
      }

      const next = cloneSettings(current);
      next.generatedImages = {};
      next.generationKey = undefined;
      const nextCrop = {
        ...currentCrop,
        croppedArea: roundArea(croppedArea, 4),
        croppedAreaPixels: roundArea(croppedAreaPixels, 0),
      };

      next.crops[placement] = nextCrop;
      return next;
    });
  }

  function selectPlacement(placement: CoverImagePlacement) {
    setSelectedPlacement(placement);
    setIsAdjusting(false);
    setCropperRevision((revision) => revision + 1);
  }

  function resetSelectedCrop() {
    const defaults = createDefaultCoverImageSettings();
    setSettings((current) => {
      const next = cloneSettings(current);
      next.generatedImages = {};
      next.generationKey = undefined;

      next.crops[selectedPlacement] = { ...defaults.crops[selectedPlacement] };

      return next;
    });
    setCropperRevision((revision) => revision + 1);
  }

  function changeZoom(nextZoom: number) {
    if (!Number.isFinite(nextZoom)) return;
    updateSelectedTransform({
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom)),
    });
  }

  function rotateBy(degrees: number) {
    const rotation = normalizeRotation(selectedCrop.rotation + degrees);
    updateSelectedTransform({ rotation });
    setCropperRevision((revision) => revision + 1);
  }

  function handleInteractionStart() {
    setIsAdjusting(true);
  }

  function handleInteractionEnd() {
    setIsAdjusting(false);
  }

  return (
    <dialog
      aria-describedby="cover-crop-description"
      aria-labelledby="cover-crop-title"
      className="cover-crop-dialog m-auto max-h-[calc(100dvh-1rem)] w-[min(calc(100%_-_1rem),88rem)] overflow-hidden border border-black bg-white p-0 text-black shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop:bg-black/72"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      ref={dialogRef}
    >
      <div className="flex max-h-[calc(100dvh-1rem)] min-h-0 flex-col">
        <header className="flex shrink-0 items-start justify-between gap-5 border-b border-black px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2
              className="[font-family:var(--font-editorial-title)] text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.92] tracking-[-0.035em]"
              id="cover-crop-title"
            >
              Crop cover image
            </h2>
            <p
              className="mt-2 max-w-2xl text-sm leading-6 text-black/62"
              id="cover-crop-description"
            >
              Drag the photo beneath the fixed frame. Pinch or scroll to zoom; the original upload stays untouched.
            </p>
          </div>
          <Button
            aria-label="Close crop editor"
            onClick={close}
            ref={closeButtonRef}
            size="icon"
            title="Close"
            variant="text"
          >
            <X aria-hidden="true" size={20} />
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_21rem] lg:overflow-hidden">
          <main className="min-h-0 bg-[#111] p-3 sm:p-5 lg:p-7">
            <div
              className="cover-crop-stage relative h-[clamp(20rem,57dvh,43rem)] min-h-[20rem] w-full overflow-hidden bg-[#181818]"
              onContextMenu={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
            >
              <Cropper
                aspect={selectedDefinition.aspect}
                classes={{
                  containerClassName: "cover-cropper",
                  mediaClassName: "cover-cropper-media",
                  cropAreaClassName: "cover-cropper-frame",
                }}
                crop={{ x: selectedCrop.x, y: selectedCrop.y }}
                cropShape="rect"
                disableAutomaticStylesInjection
                cropperProps={{
                  "aria-describedby": "cover-crop-help",
                  "aria-label": `Crop ${selectedDefinition.label}. Drag the image, use arrow keys to reposition, or use the zoom controls.`,
                  role: "application",
                }}
                image={imageUrl}
                initialCroppedAreaPercentages={selectedCrop.croppedArea}
                key={`${selectedPlacement}-${cropperRevision}`}
                maxZoom={MAX_ZOOM}
                mediaProps={{
                  draggable: false,
                  onDragStart: (event) => event.preventDefault(),
                }}
                minZoom={MIN_ZOOM}
                onCropChange={(point) => {
                  if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
                    updateSelectedTransform(point);
                  }
                }}
                onCropComplete={(croppedArea, croppedAreaPixels) =>
                  saveCropResult(
                    selectedPlacement,
                    croppedArea,
                    croppedAreaPixels,
                  )
                }
                onInteractionEnd={handleInteractionEnd}
                onInteractionStart={handleInteractionStart}
                onRotationChange={(rotation) => {
                  if (Number.isFinite(rotation)) {
                    updateSelectedTransform({ rotation });
                  }
                }}
                onTouchRequest={() => true}
                onWheelRequest={() => true}
                onZoomChange={changeZoom}
                restrictPosition
                rotation={selectedCrop.rotation}
                roundCropAreaPixels
                showGrid={isAdjusting}
                style={{
                  containerStyle: {
                    touchAction: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  },
                }}
                zoom={selectedCrop.zoom}
                zoomSpeed={0.14}
                zoomWithScroll
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 pb-7 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white"
              >
                <span>{selectedDefinition.label}</span>
                <span>Independent crop</span>
              </div>
            </div>
            <p className="sr-only" id="cover-crop-help">
              The crop frame stays fixed while the image moves. Use arrow keys for a non-drag adjustment.
            </p>
          </main>

          <aside className="border-t border-black/15 bg-[var(--paper)] p-5 sm:p-6 lg:overflow-y-auto lg:border-l lg:border-t-0">
            <section aria-labelledby="cover-placement-heading">
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.11em]"
                  id="cover-placement-heading"
                >
                  Placement
                </h3>
                <span className="text-xs text-black/52">Crop each placement</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {COVER_IMAGE_PLACEMENTS.map((placement) => {
                  const crop = getCoverCrop(settings, placement.id);
                  const selected = placement.id === selectedPlacement;

                  return (
                    <button
                      aria-label={`Edit ${placement.label} crop`}
                      aria-pressed={selected}
                      className={cn(
                        "group min-w-0 border bg-white p-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                        selected
                          ? "border-black shadow-[inset_0_-3px_0_#101010]"
                          : "border-black/16 hover:border-black/55",
                      )}
                      key={placement.id}
                      onClick={() => selectPlacement(placement.id)}
                      type="button"
                    >
                      <div
                        className={cn(
                          "relative w-full overflow-hidden bg-[#151515]",
                          placement.previewClassName,
                        )}
                      >
                        <CoverPlacementPreview
                          crop={crop}
                          imageUrl={imageUrl}
                          placement={placement}
                          revision={cropperRevision}
                        />
                      </div>
                      <span className="mt-2 flex min-w-0 items-center justify-between gap-2 px-0.5 pb-0.5 text-[0.6rem] font-semibold uppercase leading-4 tracking-[0.07em]">
                        <span className="truncate">{placement.label}</span>
                        <span className="shrink-0 text-[var(--champagne-dark)]">Edit</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-5 border-t border-black/12 pt-5">
              <div className="flex items-center justify-between gap-3">
                <label
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.11em]"
                  htmlFor="cover-crop-zoom"
                >
                  Zoom
                </label>
                <span className="text-xs tabular-nums text-black/55">
                  {selectedCrop.zoom.toFixed(2)}×
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
                <Button
                  aria-label="Zoom out"
                  disabled={selectedCrop.zoom <= MIN_ZOOM}
                  onClick={() => changeZoom(selectedCrop.zoom - ZOOM_STEP)}
                  size="icon"
                  title="Zoom out"
                  variant="secondary"
                >
                  <Minus aria-hidden="true" size={16} />
                </Button>
                <input
                  className="block w-full accent-black"
                  id="cover-crop-zoom"
                  max={MAX_ZOOM}
                  min={MIN_ZOOM}
                  onBlur={() => setIsAdjusting(false)}
                  onChange={(event) => changeZoom(Number(event.currentTarget.value))}
                  onPointerDown={() => setIsAdjusting(true)}
                  onPointerUp={() => setIsAdjusting(false)}
                  step={0.01}
                  type="range"
                  value={selectedCrop.zoom}
                />
                <Button
                  aria-label="Zoom in"
                  disabled={selectedCrop.zoom >= MAX_ZOOM}
                  onClick={() => changeZoom(selectedCrop.zoom + ZOOM_STEP)}
                  size="icon"
                  title="Zoom in"
                  variant="secondary"
                >
                  <Plus aria-hidden="true" size={16} />
                </Button>
              </div>
            </section>

            <section className="mt-5 border-t border-black/12 pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.11em]">
                  Rotate
                </p>
                <span className="text-xs tabular-nums text-black/55">
                  {selectedCrop.rotation}°
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  aria-label="Rotate image left 90 degrees"
                  onClick={() => rotateBy(-90)}
                  size="sm"
                  title="Rotate left"
                  variant="secondary"
                >
                  <RotateCcw aria-hidden="true" size={16} />
                  Left 90°
                </Button>
                <Button
                  aria-label="Rotate image right 90 degrees"
                  onClick={() => rotateBy(90)}
                  size="sm"
                  title="Rotate right"
                  variant="secondary"
                >
                  Right 90°
                  <RotateCw aria-hidden="true" size={16} />
                </Button>
              </div>
            </section>

            <Button
              className="mt-5 w-full"
              onClick={resetSelectedCrop}
              size="sm"
              variant="text"
            >
              <Undo2 aria-hidden="true" size={15} />
              Reset this crop
            </Button>
          </aside>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-black bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs leading-5 text-black/55">
            {selectedDefinition.label} has its own crop. Select another placement to edit it.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button onClick={close} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApply(settings);
                close();
              }}
            >
              Apply crop
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}

type CoverPlacementPreviewProps = {
  crop: CoverCropMetadata;
  imageUrl: string;
  placement: CoverImagePlacementDefinition;
  revision: number;
};

function CoverPlacementPreview({
  crop,
  imageUrl,
  placement,
  revision,
}: CoverPlacementPreviewProps) {
  const [previewCrop, setPreviewCrop] = useState({ x: crop.x, y: crop.y });
  const [previewZoom, setPreviewZoom] = useState(crop.zoom);

  return (
    <Cropper
      aspect={placement.aspect}
      classes={{
        containerClassName: "cover-cropper-preview",
        mediaClassName: "cover-cropper-media",
        cropAreaClassName: "cover-cropper-preview-frame",
      }}
      crop={previewCrop}
      cropShape="rect"
      disableAutomaticStylesInjection
      cropperProps={{
        "aria-hidden": true,
        tabIndex: -1,
      }}
      image={imageUrl}
      initialCroppedAreaPercentages={crop.croppedArea}
      key={`${placement.id}-${revision}-${crop.croppedArea.x}-${crop.croppedArea.y}-${crop.croppedArea.width}-${crop.croppedArea.height}-${crop.zoom}-${crop.rotation}`}
      maxZoom={MAX_ZOOM}
      mediaProps={{ draggable: false }}
      minZoom={MIN_ZOOM}
      onCropChange={(point) =>
        setPreviewCrop((current) =>
          current.x === point.x && current.y === point.y ? current : point,
        )
      }
      onZoomChange={(nextZoom) =>
        setPreviewZoom((current) => (current === nextZoom ? current : nextZoom))
      }
      objectFit="cover"
      rotation={crop.rotation}
      roundCropAreaPixels
      showGrid={false}
      style={{
        containerStyle: { pointerEvents: "none", touchAction: "none" },
        cropAreaStyle: {
          border: 0,
          boxShadow: "none",
        },
      }}
      zoom={previewZoom}
      zoomWithScroll={false}
    />
  );
}

function cloneSettings(settings: CoverImageSettings): CoverImageSettings {
  return {
    ...settings,
    crops: Object.fromEntries(
      COVER_IMAGE_PLACEMENTS.map((placement) => [
        placement.id,
        { ...settings.crops[placement.id] },
      ]),
    ) as CoverImageSettings["crops"],
    generatedImages: { ...settings.generatedImages },
  };
}

function areasEqual(left: Area, right: Area) {
  return (
    Math.abs(left.x - right.x) < 0.01 &&
    Math.abs(left.y - right.y) < 0.01 &&
    Math.abs(left.width - right.width) < 0.01 &&
    Math.abs(left.height - right.height) < 0.01
  );
}

function roundArea(area: Area, decimalPlaces: number): Area {
  const factor = 10 ** decimalPlaces;
  return {
    x: Math.round(area.x * factor) / factor,
    y: Math.round(area.y * factor) / factor,
    width: Math.round(area.width * factor) / factor,
    height: Math.round(area.height * factor) / factor,
  };
}

function normalizeRotation(rotation: number) {
  const normalized = rotation % 360;
  return Object.is(normalized, -0) ? 0 : normalized;
}
