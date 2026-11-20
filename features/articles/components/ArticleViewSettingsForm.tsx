"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  MAX_ARTICLE_VIEWS,
  type ArticleViewMode,
} from "@/features/articles/lib/article-views";
import {
  updateArticleViewSettingsAction,
  type ArticleViewSettingsState,
} from "@/features/articles/server/article-view-actions";
import type { Article } from "@/features/articles/types/article";
import { Button, FormField, Select } from "@/shared/components/ui";

export function ArticleViewSettingsForm({ article }: { article: Article }) {
  const [mode, setMode] = useState(article.viewCountMode);
  const [manualViews, setManualViews] = useState(String(article.manualViews));
  const [changed, setChanged] = useState(false);
  const [state, action, pending] = useActionState(
    updateArticleViewSettingsAction.bind(null, article.id),
    { status: "idle" } as ArticleViewSettingsState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.fieldErrors) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);
  const errors = changed ? {} : state.fieldErrors;

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      aria-labelledby="view-settings-heading"
      className="mb-8 border-y border-black/15 py-5"
      onSubmit={() => setChanged(false)}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="view-settings-heading" className="text-sm font-semibold">
          Article views
        </h2>
        <p className="text-sm">
          Actual views:{" "}
          <strong>
            {(state.actualViews ?? article.views).toLocaleString("en-US")}
          </strong>
        </p>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-[1fr_1fr_auto]">
        <FormField
          id="article-view-mode"
          label="Display views from"
          error={errors?.viewCountMode}
          help="Actual views keep counting in either mode."
        >
          <Select
            id="article-view-mode"
            name="viewCountMode"
            value={mode}
            disabled={pending}
            invalid={Boolean(errors?.viewCountMode)}
            ariaDescribedBy={
              errors?.viewCountMode
                ? "article-view-mode-error"
                : "article-view-mode-help"
            }
            onChange={(value) => {
              setMode(value as ArticleViewMode);
              setChanged(true);
            }}
            options={[
              { label: "Actual views", value: "actual" },
              { label: "Manual views", value: "manual" },
            ]}
          />
        </FormField>
        <FormField
          id="article-manual-views"
          label="Manual view count"
          error={errors?.manualViews}
          help="Displayed only when Manual views is selected."
        >
          <input
            id="article-manual-views"
            name="manualViews"
            className="article-form-control"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_ARTICLE_VIEWS}
            step={1}
            readOnly={pending}
            value={manualViews}
            aria-invalid={Boolean(errors?.manualViews)}
            aria-describedby={
              errors?.manualViews
                ? "article-manual-views-error"
                : "article-manual-views-help"
            }
            onChange={(event) => {
              setManualViews(event.target.value);
              setChanged(true);
            }}
          />
        </FormField>
        <Button
          type="submit"
          className="md:mt-6"
          disabled={pending}
          isLoading={pending}
          loadingLabel="Saving views…"
        >
          Save view settings
        </Button>
      </div>
      {!changed && state.message ? (
        <p
          className={`mt-3 text-sm ${state.status === "error" ? "text-red-700" : "text-black/70"}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
