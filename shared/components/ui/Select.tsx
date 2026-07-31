"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
};

type SelectPosition = {
  bottom?: number;
  left: number;
  maxHeight: number;
  top?: number;
  width: number;
};

export type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  id?: string;
  invalid?: boolean;
  label?: string;
  name?: string;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  triggerClassName?: string;
};

const VIEWPORT_MARGIN = 12;
const PANEL_GAP = 6;
const MAX_PANEL_HEIGHT = 320;

export function Select({
  options,
  value,
  onChange,
  ariaDescribedBy,
  ariaLabel,
  className,
  disabled = false,
  error,
  hint,
  icon,
  id,
  invalid = false,
  label,
  name,
  onBlur,
  placeholder = "Select an option",
  required = false,
  triggerClassName,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId.replaceAll(":", "")}`;
  const labelId = `${selectId}-label`;
  const valueId = `${selectId}-value`;
  const listboxId = `${selectId}-listbox`;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState<string | null>(
    null,
  );
  const [position, setPosition] = useState<SelectPosition | null>(null);

  const enabledOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options],
  );
  const selectedOption =
    options.find((option) => option.value === value) ?? null;
  const describedBy = [
    ariaDescribedBy,
    error ? errorId : null,
    hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const availableWidth = window.innerWidth - VIEWPORT_MARGIN * 2;
    const width = Math.min(Math.max(rect.width, 220), availableWidth);
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      window.innerWidth - width - VIEWPORT_MARGIN,
    );
    const spaceBelow =
      window.innerHeight - rect.bottom - VIEWPORT_MARGIN - PANEL_GAP;
    const spaceAbove =
      rect.top - VIEWPORT_MARGIN - PANEL_GAP;
    const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
    const availableHeight = openAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(
      96,
      Math.min(MAX_PANEL_HEIGHT, availableHeight),
    );

    setPosition({
      bottom: openAbove
        ? window.innerHeight - rect.top + PANEL_GAP
        : undefined,
      left,
      maxHeight,
      top: openAbove ? undefined : rect.bottom + PANEL_GAP,
      width,
    });
  }, []);

  const close = useCallback(
    (restoreFocus = false) => {
      setIsOpen(false);
      setPosition(null);
      onBlur?.();

      if (restoreFocus) {
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    },
    [onBlur],
  );

  const open = useCallback(
    (direction: "first" | "last" | "selected" = "selected") => {
      if (disabled || enabledOptions.length === 0) {
        return;
      }

      const initialOption =
        direction === "first"
          ? enabledOptions[0]
          : direction === "last"
            ? enabledOptions[enabledOptions.length - 1]
            : enabledOptions.find((option) => option.value === value) ??
              enabledOptions[0];

      setHighlightedValue(initialOption?.value ?? null);
      updatePosition();
      setIsOpen(true);
    },
    [disabled, enabledOptions, updatePosition, value],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !triggerRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        close();
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [close, isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen || !highlightedValue) {
      return;
    }

    optionRefs.current
      .get(highlightedValue)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedValue, isOpen]);

  useEffect(
    () => () => {
      if (typeaheadTimerRef.current) {
        clearTimeout(typeaheadTimerRef.current);
      }
    },
    [],
  );

  function moveHighlight(direction: 1 | -1) {
    if (enabledOptions.length === 0) {
      return;
    }

    const currentIndex = enabledOptions.findIndex(
      (option) => option.value === highlightedValue,
    );
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : enabledOptions.length - 1
        : (currentIndex + direction + enabledOptions.length) %
          enabledOptions.length;

    setHighlightedValue(enabledOptions[nextIndex]?.value ?? null);
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    close(true);
  }

  function handleTypeahead(key: string) {
    if (!/^[\p{L}\p{N} ]$/u.test(key)) {
      return null;
    }

    typeaheadRef.current += key.toLocaleLowerCase();

    if (typeaheadTimerRef.current) {
      clearTimeout(typeaheadTimerRef.current);
    }

    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadRef.current = "";
    }, 600);

    const match = enabledOptions.find((option) =>
      option.label.toLocaleLowerCase().startsWith(typeaheadRef.current),
    );

    return match?.value ?? null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (isOpen) {
        moveHighlight(1);
      } else {
        open("selected");
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (isOpen) {
        moveHighlight(-1);
      } else {
        open("last");
      }
      return;
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setHighlightedValue(enabledOptions[0]?.value ?? null);
      return;
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      setHighlightedValue(
        enabledOptions[enabledOptions.length - 1]?.value ?? null,
      );
      return;
    }

    if (
      (event.key === "Enter" || event.key === " ") &&
      isOpen
    ) {
      event.preventDefault();
      const option = options.find(
        (item) => item.value === highlightedValue,
      );

      if (option) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close(true);
      return;
    }

    if (event.key === "Tab" && isOpen) {
      close();
      return;
    }

    if (!isOpen && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      open();
      return;
    }

    const typeaheadMatch = handleTypeahead(event.key);

    if (typeaheadMatch) {
      if (!isOpen) {
        open();
      }
      setHighlightedValue(typeaheadMatch);
    }
  }

  function handleBlur() {
    window.setTimeout(() => {
      const activeElement = document.activeElement;

      if (
        activeElement &&
        !triggerRef.current?.contains(activeElement) &&
        !panelRef.current?.contains(activeElement)
      ) {
        if (isOpen) {
          close();
        } else {
          onBlur?.();
        }
      }
    }, 0);
  }

  const panelStyle: CSSProperties | undefined = position
    ? {
        bottom: position.bottom,
        left: position.left,
        maxHeight: position.maxHeight,
        top: position.top,
        width: position.width,
      }
    : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      {label ? (
        <label
          className="editorial-kicker mb-2 block"
          htmlFor={selectId}
          id={labelId}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <Button
        aria-activedescendant={
          isOpen && highlightedValue
            ? `${listboxId}-${toDomId(highlightedValue)}`
            : undefined
        }
        aria-controls={listboxId}
        aria-describedby={describedBy || undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error) || invalid || undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
        aria-required={required || undefined}
        className={cn(
          "min-h-12 w-full justify-between gap-3 px-3 text-left text-sm font-normal normal-case tracking-normal hover:translate-y-0",
          !selectedOption && "text-black/45",
          (error || invalid) &&
            "border-red-700 hover:border-red-700",
          triggerClassName,
        )}
        disabled={disabled}
        id={selectId}
        onBlur={handleBlur}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
        role="combobox"
        variant="secondary"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedOption?.icon ?? icon}
          <span className="truncate" id={valueId}>
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-transform duration-150",
            isOpen && "rotate-180",
          )}
          size={16}
          strokeWidth={1.6}
        />
      </Button>

      {error ? (
        <p
          className="mt-2 text-xs leading-5 text-red-700"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-5 text-black/52" id={hintId}>
          {hint}
        </p>
      ) : null}

      {isOpen && position
        ? createPortal(
            <div
              className="fixed z-[1000] overflow-y-auto overscroll-contain border border-black bg-white p-1 shadow-[0_18px_50px_rgba(0,0,0,0.16)] [scrollbar-color:rgba(0,0,0,0.35)_transparent] [scrollbar-width:thin]"
              id={listboxId}
              ref={panelRef}
              role="listbox"
              style={panelStyle}
            >
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = option.value === value;
                  const isHighlighted =
                    option.value === highlightedValue;

                  return (
                    <button
                      aria-selected={isSelected}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                        isSelected && "bg-black text-white",
                        isHighlighted &&
                          !isSelected &&
                          "bg-black/[0.06]",
                        option.disabled &&
                          "cursor-not-allowed text-black/35",
                      )}
                      disabled={option.disabled}
                      id={`${listboxId}-${toDomId(option.value)}`}
                      key={option.value}
                      onClick={() => selectOption(option)}
                      onMouseEnter={() =>
                        !option.disabled &&
                        setHighlightedValue(option.value)
                      }
                      ref={(element) => {
                        if (element) {
                          optionRefs.current.set(option.value, element);
                        } else {
                          optionRefs.current.delete(option.value);
                        }
                      }}
                      role="option"
                      tabIndex={-1}
                      type="button"
                    >
                      {option.icon ? (
                        <span className="shrink-0">{option.icon}</span>
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block break-words">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span
                            className={cn(
                              "mt-0.5 block text-xs leading-5 text-black/52",
                              isSelected && "text-white/70",
                            )}
                          >
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                      <Check
                        aria-hidden="true"
                        className={cn(
                          "shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                        size={15}
                        strokeWidth={2}
                      />
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-4 text-sm text-black/52">
                  No options available
                </p>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function toDomId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
