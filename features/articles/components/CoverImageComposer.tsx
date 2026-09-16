"use client";

import Image from "next/image";
import {
  Crosshair,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
} from "lucide-react";
import {
  type PointerEvent,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  getCoverImageStyle,
  normalizeCoverImageSettings,
  type CoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import { Button } from "@/shared/components/ui";

type CoverImageComposerProps = {
  imageUrl: string;
  onApply: (settings: CoverImageSettings) => void;
  onOpenChange: (open: boolean) => void;
  value: CoverImageSettings;
};

const PREVIEW_FRAMES = [
  { label: "Story card", ratio: "aspect-[4/3]" },
  { label: "Homepage feature", ratio: "aspect-video" },
  { label: "Portrait rail", ratio: "aspect-[4/5]" },
] as const;

/**
 * A dedicated, non-destructive art-direction desk. Changes are held locally
 * until an editor applies them, so cancelling never alters a saved cover.
 */
export function CoverImageComposer({
  imageUrl,
  onApply,
  onOpenChange,
  value,
}: CoverImageComposerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    settings: CoverImageSettings;
  } | null>(null);
  const [settings, setSettings] = useState(() =>
    normalizeCoverImageSettings(value),
  );

  // This component only mounts while the editor has explicitly opened it.
  // Opening in a layout effect puts the native dialog in the top layer before
  // the browser can paint it as a child of the sticky admin sidebar.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  function close() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    onOpenChange(false);
  }

  function update(nextValue: Partial<CoverImageSettings>) {
    setSettings((current) =>
      normalizeCoverImageSettings({
        ...current,
        ...nextValue,
        focalPoint: nextValue.focalPoint ?? current.focalPoint,
      }),
    );
  }

  function updateFocalPoint(axis: "x" | "y", axisValue: number) {
    update({
      focalPoint: {
        ...settings.focalPoint,
        [axis]: axisValue,
      },
    });
  }

  function updateRotation(rotation: number) {
    // Rotation needs a little extra crop to prevent a frame corner showing.
    const rotationZoom =
      1 + Math.abs(Math.sin((rotation * Math.PI) / 180)) * 0.55;
    update({ rotation, zoom: Math.max(settings.zoom, rotationZoom) });
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      settings,
    };
  }

  function dragImage(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    const frame = frameRef.current;
    if (!start || !frame) return;

    const bounds = frame.getBoundingClientRect();
    update({
      focalPoint: {
        x:
          start.settings.focalPoint.x -
          ((event.clientX - start.x) / bounds.width) * 100,
        y:
          start.settings.focalPoint.y -
          ((event.clientY - start.y) / bounds.height) * 100,
      },
    });
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <dialog
      aria-describedby="cover-composition-description"
      aria-labelledby="cover-composition-title"
      className="m-auto flex max-h-[calc(100dvh-1.5rem)] w-[min(calc(100%_-_1.5rem),76rem)] flex-col overflow-hidden border border-black bg-white p-0 text-black shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop:bg-black/70"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      ref={dialogRef}
    >
      <header className="flex shrink-0 items-start justify-between gap-5 border-b border-black px-5 py-5 sm:px-7">
        <div>
          <p className="editorial-kicker text-[var(--champagne-dark)]">
            Cover art direction
          </p>
          <h2
            className="mt-2 [font-family:var(--font-editorial-title)] text-[clamp(2.15rem,4vw,3.5rem)] font-bold leading-[0.92] tracking-[-0.035em]"
            id="cover-composition-title"
          >
            Compose the image
          </h2>
          <p
            className="mt-2 max-w-2xl text-sm leading-6 text-black/62"
            id="cover-composition-description"
          >
            Position the subject for the magazine’s live story frames. Your original upload stays untouched.
          </p>
        </div>
        <Button
          aria-label="Close cover composition"
          onClick={close}
          ref={closeButtonRef}
          size="icon"
          variant="text"
        >
          <X aria-hidden="true" size={20} />
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-h-[20rem] items-center bg-[#111] p-4 sm:min-h-[28rem] sm:p-7 lg:min-h-0 lg:p-9">
          <div
            aria-describedby="cover-composition-help"
            aria-label="Cover image crop preview. Drag to move the image."
            className="relative mx-auto aspect-video w-full max-w-[58rem] touch-none select-none cursor-grab overflow-hidden border border-white/25 bg-black shadow-[0_18px_42px_rgba(0,0,0,0.36)] active:cursor-grabbing"
            onDragStart={(event) => event.preventDefault()}
            onPointerCancel={finishDrag}
            onPointerDown={beginDrag}
            onPointerMove={dragImage}
            onPointerUp={finishDrag}
            ref={frameRef}
            role="group"
          >
            <Image
              alt=""
              className="object-cover"
              draggable={false}
              fill
              priority
              sizes="(min-width: 1280px) 70vw, 100vw"
              src={imageUrl}
              style={getCoverImageStyle(settings)}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center border border-white/90 bg-black/25 text-white shadow-sm"
              style={{
                left: `${settings.focalPoint.x}%`,
                top: `${settings.focalPoint.y}%`,
              }}
            >
              <Crosshair size={17} strokeWidth={1.5} />
            </span>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-white/20 bg-black/70 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/90">
              Homepage feature preview
            </span>
          </div>
          <p className="sr-only" id="cover-composition-help">
            Use the focus, zoom, and rotation controls to adjust this image without dragging.
          </p>
        </div>

        <aside className="border-t border-black/15 bg-[#f6f4ef] p-5 sm:p-6 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="space-y-5">
            <section>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]">
                Fine tune
              </p>
              <div className="mt-4 space-y-4">
                <ComposerRange
                  icon={<MoveHorizontal aria-hidden="true" size={15} />}
                  label="Horizontal focus"
                  max={100}
                  min={0}
                  onChange={(nextValue) => updateFocalPoint("x", nextValue)}
                  value={settings.focalPoint.x}
                  valueText={`${Math.round(settings.focalPoint.x)}%`}
                />
                <ComposerRange
                  icon={<MoveVertical aria-hidden="true" size={15} />}
                  label="Vertical focus"
                  max={100}
                  min={0}
                  onChange={(nextValue) => updateFocalPoint("y", nextValue)}
                  value={settings.focalPoint.y}
                  valueText={`${Math.round(settings.focalPoint.y)}%`}
                />
                <ComposerRange
                  icon={<ZoomIn aria-hidden="true" size={15} />}
                  label="Crop / zoom"
                  max={3}
                  min={1}
                  onChange={(nextValue) => update({ zoom: nextValue })}
                  step={0.05}
                  value={settings.zoom}
                  valueText={`${settings.zoom.toFixed(2)}×`}
                />
              </div>
            </section>

            <section className="border-y border-black/10 py-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]">
                  Rotation
                </span>
                <span className="text-xs tabular-nums text-black/58">
                  {Math.round(settings.rotation)}°
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  aria-label="Rotate image counter-clockwise 15 degrees"
                  onClick={() => updateRotation(settings.rotation - 15)}
                  size="sm"
                  variant="secondary"
                >
                  <RotateCcw aria-hidden="true" size={15} />
                  15°
                </Button>
                <Button
                  onClick={() => updateRotation(0)}
                  size="sm"
                  variant="text"
                >
                  Straighten
                </Button>
                <Button
                  aria-label="Rotate image clockwise 15 degrees"
                  onClick={() => updateRotation(settings.rotation + 15)}
                  size="sm"
                  variant="secondary"
                >
                  15°
                  <RotateCw aria-hidden="true" size={15} />
                </Button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]">
                  Across the Journal
                </p>
                <Button
                  className="min-h-9 px-2"
                  onClick={() => setSettings(normalizeCoverImageSettings(null))}
                  size="sm"
                  variant="text"
                >
                  Reset
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PREVIEW_FRAMES.map((preview) => (
                  <figure key={preview.label}>
                    <div
                      className={`relative overflow-hidden border border-black/15 bg-[#eceae4] ${preview.ratio}`}
                    >
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="110px"
                        src={imageUrl}
                        style={getCoverImageStyle(settings)}
                      />
                    </div>
                    <figcaption className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.07em] text-black/52">
                      {preview.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>

      <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-black bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-xs leading-5 text-black/55">
          Drag for direct positioning, or use the controls for precise adjustments.
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
            Apply composition
          </Button>
        </div>
      </footer>
    </dialog>
  );
}

type ComposerRangeProps = {
  icon: ReactNode;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
  valueText: string;
};

function ComposerRange({
  icon,
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueText,
}: ComposerRangeProps) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em]">
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-xs normal-case tracking-normal text-black/58">
          {valueText}
        </span>
      </span>
      <input
        aria-label={label}
        className="mt-2 block w-full accent-black"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}
