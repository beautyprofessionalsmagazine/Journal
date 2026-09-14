"use server";

import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { lookbookTable } from "@/features/lookbook/db/lookbook-schema";
import {
  ACTIVE_LOOKBOOK_ID,
  getActiveLookbook,
} from "@/features/lookbook/server/lookbook-queries";
import type { LookbookActionResult } from "@/features/lookbook/types/lookbook";
import { db } from "@/shared/lib/db";

const MAX_LOOKBOOK_SIZE_BYTES = 50 * 1024 * 1024;

type SaveLookbookInput = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
};

export async function saveLookbookAction(
  input: SaveLookbookInput,
): Promise<LookbookActionResult> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const validationError = validateLookbookInput(input);

  if (validationError) {
    return { status: "error", message: validationError };
  }

  const previous = await getActiveLookbook();

  try {
    const [lookbook] = await db
      .insert(lookbookTable)
      .values({ id: ACTIVE_LOOKBOOK_ID, ...input, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: lookbookTable.id,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();

    if (previous?.fileUrl && previous.fileUrl !== lookbook.fileUrl) {
      await deleteStoredPdf(previous.fileUrl);
    }

    revalidatePath("/lookbook");
    revalidatePath("/admin/lookbook");

    return {
      status: "success",
      message: previous ? "Lookbook replaced." : "Lookbook published.",
      lookbook,
    };
  } catch (error) {
    console.error("[lookbook] Failed to save Lookbook.", error);
    return {
      status: "error",
      message: "The Lookbook could not be saved. Your uploaded PDF is still available to retry.",
    };
  }
}

export async function removeLookbookAction(): Promise<LookbookActionResult> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const current = await getActiveLookbook();

  if (!current) {
    return { status: "error", message: "There is no active Lookbook to remove." };
  }

  try {
    await db.delete(lookbookTable).where(eq(lookbookTable.id, ACTIVE_LOOKBOOK_ID));
    await deleteStoredPdf(current.fileUrl);
    revalidatePath("/lookbook");
    revalidatePath("/admin/lookbook");

    return { status: "success", message: "Lookbook removed." };
  } catch (error) {
    console.error("[lookbook] Failed to remove Lookbook.", error);
    return {
      status: "error",
      message: "The Lookbook could not be removed. Please try again.",
    };
  }
}

function validateLookbookInput(input: SaveLookbookInput) {
  if (!isSafeLookbookUrl(input.fileUrl)) {
    return "The uploaded PDF URL is invalid. Upload the file again.";
  }

  if (!input.fileName.toLowerCase().endsWith(".pdf")) {
    return "Choose a PDF file.";
  }

  if (!Number.isInteger(input.fileSize) || input.fileSize <= 0) {
    return "The selected PDF is empty or invalid.";
  }

  if (input.fileSize > MAX_LOOKBOOK_SIZE_BYTES) {
    return "The PDF is too large. Choose a file under 50 MB.";
  }

  return null;
}

function isSafeLookbookUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

async function deleteStoredPdf(url: string) {
  try {
    await del(url);
  } catch (error) {
    console.error("[lookbook] Failed to delete replaced PDF from Blob.", error);
  }
}

export { MAX_LOOKBOOK_SIZE_BYTES };
