"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/shared/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending = false,
  error,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-describedby="confirm-dialog-description"
      aria-labelledby="confirm-dialog-title"
      className="confirm-dialog m-auto w-[min(calc(100%_-_2rem),32rem)] border border-black bg-white p-0 text-black shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop:bg-black/60"
      onCancel={(event) => {
        if (isPending) event.preventDefault();
        else onCancel();
      }}
      onClose={onCancel}
      ref={dialogRef}
    >
      <div className="border-b border-black px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="editorial-kicker text-red-700">Permanent action</p>
            <h2
              className="mt-2 [font-family:var(--font-editorial-title)] text-4xl font-bold leading-none"
              id="confirm-dialog-title"
            >
              {title}
            </h2>
          </div>
          <Button
            aria-label="Close dialog"
            disabled={isPending}
            onClick={onCancel}
            size="icon"
            variant="text"
          >
            <X aria-hidden="true" size={20} />
          </Button>
        </div>
      </div>
      <div className="px-5 py-6 sm:px-7">
        <p className="text-sm leading-6 text-black/68" id="confirm-dialog-description">
          {description}
        </p>
        <div className="min-h-8 pt-3">
          {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
        </div>
        <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isPending} onClick={onCancel} ref={cancelRef} variant="secondary">
            Keep Lookbook
          </Button>
          <Button
            isLoading={isPending}
            loadingLabel="Removing"
            onClick={onConfirm}
            variant="destructive"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
