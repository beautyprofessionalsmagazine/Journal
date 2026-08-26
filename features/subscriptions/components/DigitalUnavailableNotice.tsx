import { ArrowRight, Clock, MapPin } from "lucide-react";

import { digitalSubscriptionsUnavailableMessage } from "@/features/subscriptions/types/subscription";
import { Button, ButtonLink } from "@/shared/components/ui";

type DigitalUnavailableNoticeProps = {
  /** Switches the plan selector to the salon (printed) route. */
  onChoosePrint: () => void;
};

/**
 * Replaces the individual subscription form while email delivery is paused. It
 * states the pause plainly and points to the routes that are still open, so the
 * professional never lands on a dead end.
 */
export function DigitalUnavailableNotice({
  onChoosePrint,
}: DigitalUnavailableNoticeProps) {
  return (
    <div
      className="border border-black/15 bg-[#f6f4ef] p-[clamp(1.5rem,4vw,2.75rem)]"
      role="status"
    >
      <span className="inline-flex size-11 items-center justify-center border border-black/25 text-black">
        <Clock aria-hidden="true" size={20} strokeWidth={1.6} />
      </span>
      <p className="editorial-kicker mt-6 text-black/45">Currently paused</p>
      <h3 className="mt-3 [font-family:var(--font-editorial-title)] text-[clamp(1.7rem,3.2vw,2.4rem)] font-bold leading-[1] tracking-[-0.02em]">
        Email delivery is paused
      </h3>
      <p className="mt-4 max-w-md text-sm leading-7 text-black/64">
        {digitalSubscriptionsUnavailableMessage}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button onClick={onChoosePrint} size="lg">
          Get printed copies
          <ArrowRight aria-hidden="true" size={16} />
        </Button>
        <ButtonLink href="/where-to-find" size="lg" variant="secondary">
          <MapPin aria-hidden="true" size={16} />
          Find a copy near you
        </ButtonLink>
      </div>
    </div>
  );
}
