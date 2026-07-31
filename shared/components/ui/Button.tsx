import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
} from "react";

import { cn } from "@/shared/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "text"
  | "icon"
  | "destructive";

export type ButtonSize = "sm" | "default" | "lg" | "icon";

const buttonBase =
  "focus-ring relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap border text-center [font-family:var(--font-editorial-sans)] font-semibold uppercase tracking-[0.075em] outline-none transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:-translate-y-px active:translate-y-px disabled:cursor-not-allowed disabled:hover:translate-y-0 motion-reduce:transform-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "border-black bg-black text-white hover:bg-white hover:text-black disabled:border-black/55 disabled:bg-black/55 disabled:text-white",
  secondary:
    "border-black/20 bg-white text-black hover:border-black hover:bg-black hover:text-white disabled:border-black/15 disabled:bg-black/[0.03] disabled:text-black/55",
  outline:
    "border-black bg-transparent text-black hover:bg-black hover:text-white disabled:border-black/20 disabled:bg-black/[0.03] disabled:text-black/55",
  text:
    "border-transparent bg-transparent text-black hover:border-black/10 hover:bg-black/[0.04] disabled:text-black/40",
  icon:
    "border-black/20 bg-transparent text-black hover:border-black hover:bg-black hover:text-white disabled:border-black/10 disabled:bg-black/[0.03] disabled:text-black/40",
  destructive:
    "border-[#8b1e1e] bg-transparent text-[#8b1e1e] hover:bg-[#8b1e1e] hover:text-white disabled:border-black/15 disabled:bg-black/[0.03] disabled:text-black/55",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-[0.67rem]",
  default: "min-h-11 px-4 text-[0.72rem]",
  lg: "min-h-12 px-5 text-xs",
  icon: "size-11 min-h-11 p-0",
};

type ButtonStyleOptions = {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function buttonStyles({
  className,
  size,
  variant = "primary",
}: ButtonStyleOptions = {}) {
  const resolvedSize = size ?? (variant === "icon" ? "icon" : "default");

  return cn(
    buttonBase,
    buttonVariants[variant],
    buttonSizes[resolvedSize],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      isLoading = false,
      loadingLabel = "Loading",
      size,
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) {
    return (
      <button
        aria-busy={isLoading || undefined}
        className={buttonStyles({ className, size, variant })}
        disabled={disabled || isLoading}
        ref={ref}
        type={type}
        {...props}
      >
        {isLoading ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
              strokeWidth={1.8}
            />
            {loadingLabel ? <span>{loadingLabel}</span> : null}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function ButtonLink({
  children,
  className,
  size,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonStyles({ className, size, variant })}
      {...props}
    >
      {children}
    </Link>
  );
}
