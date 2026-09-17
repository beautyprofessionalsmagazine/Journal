"use server";

import { del } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasAdminSession } from "@/features/admin/server/admin-auth";
import { lookbookTable } from "@/features/lookbook/db/lookbook-schema";
import { getLookbookIssueLabel, isValidLookbookIssue } from "@/features/lookbook/lib/lookbook-issue";
import { getLookbookIssue } from "@/features/lookbook/server/lookbook-queries";
import type { LookbookActionResult } from "@/features/lookbook/types/lookbook";
import { db } from "@/shared/lib/db";

const MAX_LOOKBOOK_SIZE_BYTES = 50 * 1024 * 1024;

type SaveLookbookInput = {
  issueYear: number;
  issueMonth: number;
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

  const previous = await getLookbookIssue(input.issueYear, input.issueMonth);
  const issueLabel = getLookbookIssueLabel(input);

  try {
    const [lookbook] = await db
      .insert(lookbookTable)
      .values({ id: crypto.randomUUID(), ...input, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [lookbookTable.issueYear, lookbookTable.issueMonth],
        set: {
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (previous?.fileUrl && previous.fileUrl !== lookbook.fileUrl) {
      await deleteStoredPdf(previous.fileUrl);
    }

    revalidatePath("/lookbook");
    revalidatePath("/admin/lookbook");

    return {
      status: "success",
      message: previous
        ? `${issueLabel} Lookbook replaced.`
        : `${issueLabel} Lookbook published.`,
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

type LookbookIssueInput = {
  issueYear: number;
  issueMonth: number;
};

export async function removeLookbookAction(
  input: LookbookIssueInput,
): Promise<LookbookActionResult> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  if (!isValidLookbookIssue(input.issueYear, input.issueMonth)) {
    return { status: "error", message: "Choose a valid issue date." };
  }

  const current = await getLookbookIssue(input.issueYear, input.issueMonth);

  if (!current) {
    return { status: "error", message: "There is no Lookbook for that issue." };
  }

  try {
    await db
      .delete(lookbookTable)
      .where(
        and(
          eq(lookbookTable.issueYear, input.issueYear),
          eq(lookbookTable.issueMonth, input.issueMonth),
        ),
      );
    await deleteStoredPdf(current.fileUrl);
    revalidatePath("/lookbook");
    revalidatePath("/admin/lookbook");

    return {
      status: "success",
      message: `${getLookbookIssueLabel(current)} Lookbook removed.`,
    };
  } catch (error) {
    console.error("[lookbook] Failed to remove Lookbook.", error);
    return {
      status: "error",
      message: "The Lookbook could not be removed. Please try again.",
    };
  }
}

export async function discardLookbookUploadAction(fileUrl: string) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  if (!isSafeLookbookUrl(fileUrl)) {
    return { status: "error" as const, message: "The uploaded PDF URL is invalid." };
  }

  try {
    await del(fileUrl);
    return { status: "success" as const, message: "Upload discarded." };
  } catch (error) {
    console.error("[lookbook] Failed to discard unpublished PDF.", error);
    return {
      status: "error" as const,
      message: "The upload could not be discarded. Please try again.",
    };
  }
}

function validateLookbookInput(input: SaveLookbookInput) {
  if (!isValidLookbookIssue(input.issueYear, input.issueMonth)) {
    return "Choose a valid issue date.";
  }

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
