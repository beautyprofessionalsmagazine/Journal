"use client";

import {
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
} from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createDefaultCrop,
  normalizeCoverImageSettings,
  resolveCoverCrop,
  type CoverCropMetadata,
  type CoverImagePlacement,
  type CoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import {
  COVER_PLACEMENT_LIST,
  coverFrameProps,
  formatPlacementSize,
  getCoverPlacement,
  getRotatedSize,
  isPositiveArea,
} from "@/features/articles/lib/cover-placements";
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

type NaturalSize = { width: number; height: number };

/**
 * A non-destructive crop desk. Each placement's frame takes its aspect from
 * the shared placement config, so the frame, the previews, the generated file,
 * and the public container are the same shape. Generated files are produced
 * only after the article is saved on the server.
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
  const naturalSize = useImageNaturalSize(imageUrl);
  // Every crop as the server will cut it: un-framed placements become the
  // centered default and legacy crops saved for another ratio are re-fitted.
  // The cropper, previews, and Apply all read this, never raw settings.
  const framedSettings = useMemo(
    () => (naturalSize ? frameAllCrops(settings, naturalSize) : null),
    [naturalSize, settings],
  );
  const [selectedPlacement, setSelectedPlacement] =
    useState<CoverImagePlacement>("homepageFeature");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [cropperRevision, setCropperRevision] = useState(0);
  // react-easy-crop measures its container on mount, and does so immediately
  // when the image is already cached — always the case right after an upload,
  // which preloads the URL. Children mount before this component's layout
  // effect calls showModal(), so croppers rendered up front would measure a
  // closed (display: none) dialog as 0×0 and derive a NaN zoom, which loops
  // setState until React throws. Mount them only once the dialog is open.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedDefinition = getCoverPlacement(selectedPlacement);
  const selectedCrop = (framedSettings ?? settings).crops[selectedPlacement];

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverscroll = document.documentElement.style.overscrollBehavior;

    if (!dialog.open) dialog.showModal();
    setIsDialogOpen(dialog.open);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    closeButtonRef.current?.focus();

    // No dialog.close() here: unmounting removes the dialog from the document,
    // which already takes it out of the top layer. Closing it would also make
    // Strict Mode's effect replay remount the croppers inside a closed dialog.
    return () => {
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
      next.crops[selectedPlacement] = {
        ...current.crops[selectedPlacement],
        ...patch,
      };
      return next;
    });
  }

  // Wired to onCropAreaChange, not onCropComplete: when a saved crop is
  // restored, react-easy-crop first emits the area for the stale controlled
  // position and then repositions — and if only x/y moved it reports the
  // corrected area through onCropAreaChange alone. Listening to
  // onCropComplete persisted the stale area. This also drives live previews.
  function saveCropArea(
    placement: CoverImagePlacement,
    croppedArea: Area,
    croppedAreaPixels: Area,
  ) {
    // A cropper measured before layout reports NaN or zero-sized areas;
    // never let one replace a real crop.
    if (!isPositiveArea(croppedArea) || !isPositiveArea(croppedAreaPixels)) {
      return;
    }

    setSettings((current) => {
      const currentCrop = current.crops[placement];

      if (
        areasEqual(currentCrop.croppedArea, croppedArea) &&
        areasEqual(currentCrop.croppedAreaPixels, croppedAreaPixels)
      ) {
        return current;
      }

      const next = cloneSettings(current);
      next.crops[placement] = {
        ...currentCrop,
        croppedArea: roundArea(croppedArea, 4),
        croppedAreaPixels: roundArea(croppedAreaPixels, 0),
      };
      return next;
    });
  }

  function selectPlacement(placement: CoverImagePlacement) {
    setSelectedPlacement(placement);
    setIsAdjusting(false);
    setCropperRevision((revision) => revision + 1);
  }

  function resetSelectedCrop() {
    setSettings((current) => {
      const next = cloneSettings(current);
      next.crops[selectedPlacement] = createDefaultCrop();
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
    // The saved area belongs to the previous orientation, so a rotation
    // starts that placement again from a centered frame.
    setSettings((current) => {
      const next = cloneSettings(current);
      next.crops[selectedPlacement] = createDefaultCrop(
        current.crops[selectedPlacement].rotation + degrees,
      );
      return next;
    });
    setCropperRevision((revision) => revision + 1);
  }

  function apply() {
    // Every placement leaves the editor explicit and valid — never as the
    // zero-sized placeholder older records persisted for unopened tabs.
    onApply(framedSettings ?? settings);
    close();
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
          <main className="bg-[#111] p-3 sm:p-5 lg:min-h-0 lg:p-7">
            <div
              className="cover-crop-stage relative h-[clamp(20rem,57dvh,43rem)] min-h-[20rem] w-full overflow-hidden bg-[#181818]"
              onContextMenu={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
            >
              {isDialogOpen && framedSettings ? (
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
                  onCropAreaChange={(croppedArea, croppedAreaPixels) =>
                    saveCropArea(
                      selectedPlacement,
                      croppedArea,
                      croppedAreaPixels,
                    )
                  }
                  onInteractionEnd={handleInteractionEnd}
                  onInteractionStart={handleInteractionStart}
                  // No onRotationChange on purpose: with it, react-easy-crop
                  // turns two-finger touch and Safari trackpad gestures into
                  // free-angle rotations the generator cannot reproduce.
                  // Rotation is quarter turns through the buttons only.
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
              ) : null}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 pb-7 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white"
              >
                <span>{selectedDefinition.label}</span>
                <span>{formatPlacementSize(selectedPlacement)}</span>
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
                {COVER_PLACEMENT_LIST.map((placement) => {
                  const crop = framedSettings?.crops[placement.id];
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
                        {...coverFrameProps(placement.id)}
                        className="relative w-full overflow-hidden bg-[#151515]"
                      >
                        {crop && naturalSize ? (
                          <CoverPlacementPreview
                            crop={crop}
                            imageUrl={imageUrl}
                            naturalSize={naturalSize}
                          />
                        ) : null}
                      </div>
                      <span className="mt-2 flex min-w-0 items-center justify-between gap-2 px-0.5 text-[0.6rem] font-semibold uppercase leading-4 tracking-[0.07em]">
                        <span className="truncate">{placement.label}</span>
                        <span className="shrink-0 text-[var(--champagne-dark)]">Edit</span>
                      </span>
                      <span className="block truncate px-0.5 pb-0.5 text-[0.6rem] leading-4 text-black/52">
                        {placement.usage}
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
            {selectedDefinition.label} has its own crop, shown exactly as {selectedDefinition.usage.toLowerCase()} will display it. Select another placement to edit it.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button onClick={close} variant="secondary">
              Cancel
            </Button>
            <Button onClick={apply}>
              Apply crop
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}

type CoverPlacementPreviewProps = {
  /** A resolved crop: valid and already in the placement aspect. */
  crop: CoverCropMetadata;
  imageUrl: string;
  naturalSize: NaturalSize;
};

/**
 * Draws a placement exactly as the server will cut it: the frame has the
 * placement aspect and the image is positioned from the same percentage area
 * that becomes croppedAreaPixels. Plain CSS, so it follows every drag and
 * zoom of the main cropper live instead of remounting a cropper per change.
 */
function CoverPlacementPreview({
  crop,
  imageUrl,
  naturalSize,
}: CoverPlacementPreviewProps) {
  const area = crop.croppedArea;
  const rotation = crop.rotation;
  const rotated = getRotatedSize(naturalSize.width, naturalSize.height, rotation);

  const boxStyle: CSSProperties = {
    position: "absolute",
    left: `${(-area.x / area.width) * 100}%`,
    top: `${(-area.y / area.height) * 100}%`,
    width: `${(100 / area.width) * 100}%`,
    height: `${(100 / area.height) * 100}%`,
  };
  const quarterTurned = rotation % 180 !== 0;
  // The box is the rotated bounding box. A quarter-turned image is laid out
  // with its unrotated sides, centered, then turned into place.
  const imageStyle: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    maxWidth: "none",
    width: quarterTurned ? `${(rotated.height / rotated.width) * 100}%` : "100%",
    height: quarterTurned ? `${(rotated.width / rotated.height) * 100}%` : "100%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
  };

  return (
    <div aria-hidden="true" style={boxStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element -- positioned by percentage crop math that next/image cannot express */}
      <img
        alt=""
        className="cover-cropper-preview-media"
        draggable={false}
        src={imageUrl}
        style={imageStyle}
      />
    </div>
  );
}

/**
 * The upright (EXIF-applied) size the browser decodes, which is also what
 * react-easy-crop measures and what Sharp's autoOrient() produces.
 */
function useImageNaturalSize(url: string) {
  const [size, setSize] = useState<(NaturalSize & { url: string }) | null>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setSize({ url, width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    image.src = url;
    return () => {
      image.onload = null;
    };
  }, [url]);

  return size?.url === url ? size : null;
}

function frameAllCrops(
  settings: CoverImageSettings,
  naturalSize: NaturalSize,
): CoverImageSettings {
  const next = cloneSettings(settings);
  for (const placement of COVER_PLACEMENT_LIST) {
    next.crops[placement.id] = resolveCoverCrop(
      next.crops[placement.id],
      placement.id,
      naturalSize.width,
      naturalSize.height,
    );
  }
  return next;
}

function cloneSettings(settings: CoverImageSettings): CoverImageSettings {
  return {
    ...settings,
    crops: Object.fromEntries(
      COVER_PLACEMENT_LIST.map((placement) => [
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
