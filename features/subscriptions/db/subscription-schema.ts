import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  organizationTypeValues,
  subscriptionDeliveryStatusValues,
  subscriptionStatusValues,
  subscriptionTypeValues,
} from "@/features/subscriptions/types/subscription";

export const subscriptionTypeEnum = pgEnum(
  "subscription_type",
  subscriptionTypeValues,
);

export const subscriptionStatusEnum = pgEnum(
  "subscription_status",
  subscriptionStatusValues,
);

export const subscriptionDeliveryStatusEnum = pgEnum(
  "subscription_delivery_status",
  subscriptionDeliveryStatusValues,
);

export const organizationTypeEnum = pgEnum(
  "organization_type",
  organizationTypeValues,
);

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: subscriptionTypeEnum("type").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("pending"),
    deliveryStatus: subscriptionDeliveryStatusEnum("delivery_status")
      .notNull()
      .default("prepare"),

    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email").notNull(),
    profession: text("profession"),

    organizationName: text("organization_name"),
    contactPerson: text("contact_person"),

    organizationType: organizationTypeEnum("organization_type"),

    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    zipCode: text("zip_code"),

    copies: integer("copies"),

    /**
     * Consent to receive the magazine and related news by email. Required on
     * the individual form, recorded for every submission.
     */
    emailConsent: boolean("email_consent").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    typeIdx: index("subscriptions_type_idx").on(table.type),
    statusIdx: index("subscriptions_status_idx").on(table.status),
    deliveryStatusIdx: index("subscriptions_delivery_status_idx").on(
      table.deliveryStatus,
    ),
    stateIdx: index("subscriptions_state_idx").on(table.state),
    createdAtIdx: index("subscriptions_created_at_idx").on(table.createdAt),
  }),
);
