import "server-only";

import {
  getSubscriptionDisplayName,
  subscriptionTypeLabels,
  type Subscription,
} from "@/features/subscriptions/types/subscription";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailDeliveryResult =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

/**
 * Everything below runs on plain `fetch`, so switching delivery on is a matter
 * of setting `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — no code change, no
 * extra dependency. Until then every send is a no-op that logs and returns
 * `skipped`, and no email failure is ever allowed to fail a form submission.
 */
export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getFromAddress());
}

export async function sendSubscriptionReceivedEmail(
  subscription: Subscription,
): Promise<EmailDeliveryResult> {
  const name = getSubscriptionDisplayName(subscription);
  const isDigital = subscription.type === "individual";

  return sendEmail({
    to: subscription.email,
    subject: "We received your Beauty Professionals Magazine subscription",
    html: renderEmail({
      heading: "Subscription received",
      intro: `Thank you, ${escapeHtml(name)}. Your ${escapeHtml(
        subscriptionTypeLabels[subscription.type].toLowerCase(),
      )} subscription request has been received by the editorial desk.`,
      body: isDigital
        ? [
            "Your request is being reviewed. Once it is approved you will receive each new issue and related news at this address.",
            "You can unsubscribe at any time by replying to this email.",
          ]
        : [
            `We have logged a request for ${subscription.copies ?? 0} copies per issue.`,
            "After approval your location is added to the Where to Find map as an Official Distribution Partner.",
          ],
    }),
  });
}

export async function sendSubscriptionApprovedEmail(
  subscription: Subscription,
): Promise<EmailDeliveryResult> {
  const name = getSubscriptionDisplayName(subscription);
  const isDigital = subscription.type === "individual";

  return sendEmail({
    to: subscription.email,
    subject: isDigital
      ? "Your Beauty Professionals Magazine subscription is active"
      : "You are now an Official Distribution Partner",
    html: renderEmail({
      heading: isDigital
        ? "Subscription active"
        : "Official Distribution Partner",
      intro: `${escapeHtml(name)}, your subscription has been approved.`,
      body: isDigital
        ? [
            "Every new issue and related news will arrive at this address, free of charge.",
          ]
        : [
            `Your shipment of ${subscription.copies ?? 0} copies per issue is now scheduled.`,
            "Your location now appears on the Where to Find Beauty Professionals Magazine map.",
          ],
    }),
  });
}

export async function sendSubscriptionAdminNotification(
  subscription: Subscription,
): Promise<EmailDeliveryResult> {
  const recipient = process.env.SUBSCRIPTION_NOTIFICATION_EMAIL;

  if (!recipient) {
    return { status: "skipped", reason: "SUBSCRIPTION_NOTIFICATION_EMAIL" };
  }

  return sendEmail({
    to: recipient,
    replyTo: subscription.email,
    subject: `New ${subscriptionTypeLabels[subscription.type]} subscription — ${getSubscriptionDisplayName(subscription)}`,
    html: renderEmail({
      heading: "New subscription request",
      intro: `${escapeHtml(getSubscriptionDisplayName(subscription))} (${escapeHtml(subscription.email)}) submitted a ${escapeHtml(subscriptionTypeLabels[subscription.type].toLowerCase())} subscription.`,
      body: ["Review and approve it in the admin subscriptions dashboard."],
    }),
  });
}

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailOptions): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getFromAddress();

  if (!apiKey || !from) {
    console.info(
      `[subscriptions] Email skipped — set RESEND_API_KEY and RESEND_FROM_EMAIL to enable delivery. (to: ${to}, subject: ${subject})`,
    );

    return { status: "skipped", reason: "RESEND_API_KEY" };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const reason = await response.text();
      console.error(
        `[subscriptions] Resend rejected the message (${response.status}): ${reason}`,
      );

      return { status: "failed", reason: `HTTP ${response.status}` };
    }

    const payload = (await response.json()) as { id?: string };

    return { status: "sent", id: payload.id ?? null };
  } catch (error) {
    console.error("[subscriptions] Resend request failed.", error);

    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? "";
}

type EmailTemplate = {
  heading: string;
  intro: string;
  body: string[];
};

function renderEmail({ heading, intro, body }: EmailTemplate) {
  const paragraphs = [intro, ...body]
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333;">${paragraph}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#f6f4ef;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #111111;border-collapse:collapse;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666666;">Beauty Professionals Magazine</p>
          <h1 style="margin:0 0 24px;font-size:30px;line-height:1.1;color:#111111;">${escapeHtml(heading)}</h1>
          ${paragraphs}
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #dddddd;padding:20px 32px;font-size:12px;font-style:italic;color:#777777;">
          Beauty is a practice. The Journal records the work.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
