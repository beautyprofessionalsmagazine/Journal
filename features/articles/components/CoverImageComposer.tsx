"use client";

import Image from "next/image";
import {
  Crosshair,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  RotateCw,
  ZoomIn,
} from "lucide-react";
import { type PointerEvent, type ReactNode, useRef } from "react";

import {
  getCoverImageStyle,
  normalizeCoverImageSettings,
  type CoverImageSettings,
} from "@/features/articles/lib/cover-image-settings";
import { Button } from "@/shared/components/ui";

type CoverImageComposerProps = {
  imageUrl: string;
  onChange: (settings: CoverImageSettings) => void;
  value: CoverImageSettings;
};

const PREVIEW_FRAMES = [
  { label: "Story card", ratio: "aspect-[4/3]" },
  { label: "Feature", ratio: "aspect-video" },
  { label: "Portrait rail", ratio: "aspect-[4/5]" },
] as const;

/**
 * A non-destructive cover art director. Sliders are the keyboard alternative
 * to directly moving the image in the main editorial frame.
 */
export function CoverImageComposer({
  imageUrl,
  onChange,
  value,
}: CoverImageComposerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; settings: CoverImageSettings } | null>(null);
  const settings = normalizeCoverImageSettings(value);

  function update(nextValue: Partial<CoverImageSettings>) {
    onChange(
      normalizeCoverImageSettings({
        ...settings,
        ...nextValue,
        focalPoint: nextValue.focalPoint ?? settings.focalPoint,
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
    // A rotated rectangular image needs a little extra crop so its corners do
    // not reveal the frame. Editors can always zoom further in intentionally.
    const rotationZoom = 1 + Math.abs(Math.sin((rotation * Math.PI) / 180)) * 0.55;
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
        x: start.settings.focalPoint.x - ((event.clientX - start.x) / bounds.width) * 100,
        y: start.settings.focalPoint.y - ((event.clientY - start.y) / bounds.height) * 100,
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
    <section aria-labelledby="cover-composition-heading" className="mt-5 border-t border-black/15 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="editorial-kicker text-[var(--champagne-dark)]">Art direction</p>
          <h3
            className="mt-1 [font-family:var(--font-editorial-title)] text-2xl font-bold leading-none"
            id="cover-composition-heading"
          >
            Frame the cover
          </h3>
        </div>
        <Button
          aria-label="Reset cover composition"
          className="size-10 min-h-10"
          onClick={() => onChange(normalizeCoverImageSettings(null))}
          title="Reset composition"
          variant="text"
        >
          <RotateCcw aria-hidden="true" size={16} />
        </Button>
      </div>

      <p className="mt-3 text-xs leading-5 text-black/58">
        Drag the image to set its focal point, then fine-tune the crop below. This framing is used across the live Journal.
      </p>

      <div
        aria-describedby="cover-composition-help"
        aria-label="Cover image crop preview. Drag to move the image."
        className="relative mt-4 aspect-video touch-none cursor-grab overflow-hidden border border-black bg-black active:cursor-grabbing"
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
          fill
          priority
          sizes="(min-width: 1280px) 304px, 100vw"
          src={imageUrl}
          style={getCoverImageStyle(settings)}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center border border-white/90 bg-black/20 text-white shadow-sm"
          style={{ left: `${settings.focalPoint.x}%`, top: `${settings.focalPoint.y}%` }}
        >
          <Crosshair size={15} strokeWidth={1.5} />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-white/20 bg-black/65 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/88">
          Live feature preview
        </span>
      </div>
      <p className="sr-only" id="cover-composition-help">
        Use the horizontal, vertical, zoom, and rotation controls after this preview to adjust the cover without dragging.
      </p>

      <div className="mt-5 space-y-4">
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

      <div className="mt-5 border-y border-black/10 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]">Rotation</span>
          <span className="text-xs tabular-nums text-black/58">{Math.round(settings.rotation)}°</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button onClick={() => updateRotation(settings.rotation - 15)} size="sm" variant="secondary">
            <RotateCcw aria-hidden="true" size={15} />
            15°
          </Button>
          <Button onClick={() => updateRotation(0)} size="sm" variant="text">Straighten</Button>
          <Button onClick={() => updateRotation(settings.rotation + 15)} size="sm" variant="secondary">
            15°
            <RotateCw aria-hidden="true" size={15} />
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]">Seen around the Journal</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {PREVIEW_FRAMES.map((preview) => (
            <figure key={preview.label}>
              <div className={`relative overflow-hidden border border-black/15 bg-[#eceae4] ${preview.ratio}`}>
                <Image alt="" className="object-cover" fill sizes="110px" src={imageUrl} style={getCoverImageStyle(settings)} />
              </div>
              <figcaption className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.07em] text-black/52">{preview.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
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

function ComposerRange({ icon, label, max, min, onChange, step = 1, value, valueText }: ComposerRangeProps) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em]">
        <span className="inline-flex items-center gap-2">{icon}{label}</span>
        <span className="text-xs normal-case tracking-normal text-black/58">{valueText}</span>
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
