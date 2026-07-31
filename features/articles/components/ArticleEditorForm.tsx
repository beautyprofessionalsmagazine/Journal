"use client";

import {
  AlertCircle,
  Check,
  Clock3,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ArticleTiptapEditor } from "@/features/articles/components/ArticleTiptapEditor";
import {
  CoverImageUploader,
  type CoverImageUploadState,
} from "@/features/articles/components/CoverImageUploader";
import {
  createArticleAction,
  updateArticleAction,
} from "@/features/articles/server/article-actions";
import {
  emptyArticleFormValues,
  getArticleFormValues,
  type Article,
  type ArticleFieldErrors,
  type ArticleFormValues,
  initialArticleFormState,
} from "@/features/articles/types/article";
import {
  getArticleFieldErrors,
  hasMeaningfulTiptapContent,
  normalizeSlug,
  validateArticleInput,
} from "@/features/articles/validation/article-validation";
import { categoryConfigs } from "@/features/categories/data/categories";

const emptyInitialValues: ArticleFormValues = {
  ...emptyArticleFormValues,
  contentJson: {
    ...emptyArticleFormValues.contentJson,
    content: [...emptyArticleFormValues.contentJson.content],
  },
};

type ArticleEditorFormProps = {
  article?: Article;
};

export function ArticleEditorForm({ article }: ArticleEditorFormProps) {
  const initialValues = useMemo(
    () => (article ? getArticleFormValues(article) : emptyInitialValues),
    [article],
  );
  const initialValuesSnapshot = useMemo(
    () => JSON.stringify(initialValues),
    [initialValues],
  );
  const articleAction = useMemo(
    () =>
      article
        ? updateArticleAction.bind(null, article.id)
        : createArticleAction,
    [article],
  );
  const [serverState, formAction, isPending] = useActionState(
    articleAction,
    initialArticleFormState,
  );
  const [values, setValues] =
    useState<ArticleFormValues>(initialValues);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [clientErrors, setClientErrors] =
    useState<ArticleFieldErrors>({});
  const [changedSinceServer, setChangedSinceServer] = useState<
    Partial<Record<keyof ArticleFormValues, boolean>>
  >({});
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [coverUploadState, setCoverUploadState] =
    useState<CoverImageUploadState>({
      error: null,
      isUploading: false,
    });
  const [isSubmitLocked, setIsSubmitLocked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submissionLockRef = useRef(false);
  const coverUploadStateRef = useRef<CoverImageUploadState>({
    error: null,
    isUploading: false,
  });

  const serializedContentJson = useMemo(
    () => JSON.stringify(values.contentJson),
    [values.contentJson],
  );
  const isDirty = useMemo(
    () => JSON.stringify(values) !== initialValuesSnapshot,
    [initialValuesSnapshot, values],
  );
  const readinessItems = useMemo(
    () => [
      {
        label: "Headline and byline",
        complete: Boolean(values.title.trim() && values.author.trim()),
      },
      {
        label: "Description",
        complete: Boolean(values.description.trim()),
      },
      {
        label: "Article body",
        complete: hasMeaningfulTiptapContent(values.contentJson),
      },
      {
        label: "Cover and alt text",
        complete: Boolean(
          values.coverImage.trim() && values.coverImageAlt.trim(),
        ),
      },
    ],
    [values],
  );

  useUnsavedChangesWarning(
    isDirty && !isPending && !isSubmitLocked,
  );

  useEffect(() => {
    if (serverState.status === "error") {
      submissionLockRef.current = false;
      const animationFrame = window.requestAnimationFrame(() => {
        setIsSubmitLocked(false);
        setClientErrors({});
        focusFirstInvalidField(formRef.current);
      });

      return () => window.cancelAnimationFrame(animationFrame);
    }
  }, [serverState]);

  function updateField<Key extends keyof ArticleFormValues>(
    field: Key,
    value: ArticleFormValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    clearFieldError(field);
  }

  function handleTitleChange(title: string) {
    setValues((currentValues) => ({
      ...currentValues,
      title,
      slug: isSlugManual ? currentValues.slug : normalizeSlug(title),
    }));
    clearFieldError("title");

    if (!isSlugManual) {
      clearFieldError("slug");
    }
  }

  function handleSlugChange(slug: string) {
    setIsSlugManual(true);
    updateField("slug", slug);
  }

  function resumeAutomaticSlug() {
    setIsSlugManual(false);
    updateField("slug", normalizeSlug(values.title));
  }

  function clearFieldError(field: keyof ArticleFormValues) {
    setClientErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setChangedSinceServer((currentFields) => ({
      ...currentFields,
      [field]: true,
    }));
    setClientMessage(null);
  }

  function validateField(field: keyof ArticleFormValues) {
    const validationResult = validateArticleInput(values);
    const fieldError = validationResult.success
      ? undefined
      : getArticleFieldErrors(validationResult.error)[field];

    setClientErrors((currentErrors) => ({
      ...currentErrors,
      [field]: fieldError,
    }));
  }

  function getFieldError(field: keyof ArticleFormValues) {
    return (
      clientErrors[field] ??
      (changedSinceServer[field]
        ? undefined
        : serverState.fieldErrors[field])
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submissionLockRef.current || isPending) {
      event.preventDefault();
      return;
    }

    if (coverUploadStateRef.current.isUploading) {
      event.preventDefault();
      setClientMessage(
        "Wait for the cover image upload to finish before saving.",
      );
      return;
    }

    if (coverUploadStateRef.current.error) {
      event.preventDefault();
      setClientMessage(
        "Retry or remove the failed cover image before saving.",
      );
      return;
    }

    const validationResult = validateArticleInput(values);

    if (!validationResult.success) {
      event.preventDefault();
      setClientErrors(getArticleFieldErrors(validationResult.error));
      setChangedSinceServer({});
      setClientMessage("Review the highlighted fields before saving.");
      window.requestAnimationFrame(() => focusFirstInvalidField(formRef.current));
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitLocked(true);
    setClientErrors({});
    setChangedSinceServer({});
    setClientMessage(null);
  }

  const isPublishing = values.status === "published";
  const isEditing = Boolean(article);
  const submitDisabled =
    isPending ||
    isSubmitLocked ||
    coverUploadState.isUploading ||
    Boolean(coverUploadState.error);

  const handleCoverUploadStateChange = useCallback(
    (nextState: CoverImageUploadState) => {
      coverUploadStateRef.current = nextState;
      setCoverUploadState(nextState);
    },
    [],
  );

  return (
    <form
      action={formAction}
      className="min-w-0 pb-24 xl:pb-0"
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <input name="coverImage" type="hidden" value={values.coverImage} />
      <input name="contentJson" type="hidden" value={serializedContentJson} />

      {clientMessage || serverState.message ? (
        <div
          className="mb-6 flex items-start gap-3 border border-red-700 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
          role="alert"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-1 shrink-0"
            size={18}
          />
          <p>{clientMessage ?? serverState.message}</p>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
        <div className="min-w-0">
          <section
            aria-labelledby="story-details-heading"
            className="border-y border-black/15"
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 py-3">
              <h2
                className="text-xs font-semibold uppercase tracking-[0.14em]"
                id="story-details-heading"
              >
                Story details
              </h2>
              <span className="text-xs text-black/45">
                <span aria-hidden="true">*</span> Required
              </span>
            </div>

            <div className="py-7 sm:py-9">
              <FormField
                error={getFieldError("title")}
                id="article-title"
                label="Headline"
                required
              >
                <input
                  aria-describedby={
                    getFieldError("title")
                      ? "article-title-error"
                      : "article-title-help"
                  }
                  aria-invalid={Boolean(getFieldError("title"))}
                  autoFocus
                  className="min-h-11 w-full border-0 border-b border-black/20 bg-transparent pb-3 [font-family:var(--font-editorial-title)] text-4xl font-bold leading-[1.05] outline-none transition placeholder:text-black/25 focus:border-black sm:text-5xl lg:text-6xl"
                  id="article-title"
                  name="title"
                  onBlur={() => validateField("title")}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Give the story a clear headline"
                  required
                  value={values.title}
                />
                {!getFieldError("title") ? (
                  <p
                    className="mt-2 text-xs leading-5 text-black/48"
                    id="article-title-help"
                  >
                    Keep it specific, memorable, and easy to scan.
                  </p>
                ) : null}
              </FormField>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <FormField
                  action={
                    <button
                      className="inline-flex min-h-11 items-center gap-1 px-2 text-[0.65rem] font-semibold uppercase text-black/55 underline decoration-black/25 underline-offset-4 transition hover:text-black"
                      onClick={resumeAutomaticSlug}
                      type="button"
                    >
                      <RotateCcw aria-hidden="true" size={11} />
                      Reset
                    </button>
                  }
                  error={getFieldError("slug")}
                  id="article-slug"
                  label="URL slug"
                  meta={isSlugManual ? "Manual" : "Auto"}
                  required
                >
                  <div className="flex min-h-12 items-center border border-black/20 bg-white focus-within:border-black">
                    <span
                      aria-hidden="true"
                      className="shrink-0 pl-3 text-sm text-black/35"
                    >
                      /
                    </span>
                    <input
                      aria-invalid={Boolean(getFieldError("slug"))}
                      className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none"
                      id="article-slug"
                      name="slug"
                      onBlur={() => {
                        updateField("slug", normalizeSlug(values.slug));
                        validateField("slug");
                      }}
                      onChange={(event) => handleSlugChange(event.target.value)}
                      placeholder="story-url"
                      required
                      value={values.slug}
                    />
                  </div>
                </FormField>

                <FormField
                  error={getFieldError("author")}
                  id="article-author"
                  label="Author"
                  required
                >
                  <input
                    aria-invalid={Boolean(getFieldError("author"))}
                    autoComplete="name"
                    className="article-form-control"
                    id="article-author"
                    name="author"
                    onBlur={() => validateField("author")}
                    onChange={(event) =>
                      updateField("author", event.target.value)
                    }
                    placeholder="Author name"
                    required
                    value={values.author}
                  />
                </FormField>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FormField
                  error={getFieldError("category")}
                  id="article-category"
                  label="Category"
                  required
                >
                  <select
                    aria-invalid={Boolean(getFieldError("category"))}
                    className="article-form-control"
                    id="article-category"
                    name="category"
                    onBlur={() => validateField("category")}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    required
                    value={values.category}
                  >
                    {categoryConfigs.map((category) => (
                      <option key={category.slug} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  error={getFieldError("tags")}
                  help="Separate tags with commas."
                  id="article-tags"
                  label="Tags"
                >
                  <input
                    aria-invalid={Boolean(getFieldError("tags"))}
                    className="article-form-control"
                    id="article-tags"
                    name="tags"
                    onBlur={() => validateField("tags")}
                    onChange={(event) =>
                      updateField("tags", event.target.value)
                    }
                    placeholder="skincare, backstage, profile"
                    value={values.tags}
                  />
                </FormField>
              </div>

              <div className="mt-5">
                <FormField
                  error={getFieldError("description")}
                  help="Used on article cards, search results, and the story intro."
                  id="article-description"
                  label="Description"
                  required={isPublishing}
                >
                  <textarea
                    aria-invalid={Boolean(getFieldError("description"))}
                    className="article-form-control min-h-32 resize-y"
                    id="article-description"
                    name="description"
                    onBlur={() => validateField("description")}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Write a concise editorial summary…"
                    required={isPublishing}
                    value={values.description}
                  />
                </FormField>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="article-body-heading"
            className="mt-8 min-w-0"
          >
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/45">
                  Writing desk
                </p>
                <h2
                  className="mt-1 [font-family:var(--font-editorial-title)] text-3xl font-bold"
                  id="article-body-heading"
                >
                  Article body <span aria-hidden="true">*</span>
                </h2>
              </div>
              <span className="hidden text-xs text-black/45 sm:block">
                TipTap rich text
              </span>
            </div>
            <ArticleTiptapEditor
              error={getFieldError("contentJson")}
              onBlur={() => validateField("contentJson")}
              onChange={(contentJson) =>
                updateField("contentJson", contentJson)
              }
              value={values.contentJson}
            />
          </section>
        </div>

        <aside
          aria-label="Cover and publishing settings"
          className="min-w-0 space-y-6 xl:sticky xl:top-6"
        >
          <section
            aria-labelledby="cover-image-heading"
            className="border border-black/15 p-4"
          >
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2
                className="[font-family:var(--font-editorial-title)] text-2xl font-bold"
                id="cover-image-heading"
              >
                Cover image
              </h2>
              <span className="text-[0.65rem] font-semibold uppercase text-black/45">
                {isPublishing ? "Required" : "Optional"}
              </span>
            </div>
            <CoverImageUploader
              error={getFieldError("coverImage")}
              onChange={(coverImage) =>
                updateField("coverImage", coverImage)
              }
              onUploadStateChange={handleCoverUploadStateChange}
              slug={values.slug}
              value={values.coverImage}
            />
            <div className="mt-4">
              <FormField
                error={getFieldError("coverImageAlt")}
                help="Describe the visual content, not its filename."
                id="article-cover-alt"
                label="Alt text"
                required={Boolean(values.coverImage)}
              >
                <textarea
                  aria-invalid={Boolean(getFieldError("coverImageAlt"))}
                  className="article-form-control min-h-24 resize-y"
                  id="article-cover-alt"
                  name="coverImageAlt"
                  onBlur={() => validateField("coverImageAlt")}
                  onChange={(event) =>
                    updateField("coverImageAlt", event.target.value)
                  }
                  placeholder="A makeup artist working backstage…"
                  required={Boolean(values.coverImage)}
                  value={values.coverImageAlt}
                />
              </FormField>
            </div>
          </section>

          <section
            aria-labelledby="publishing-heading"
            className="border border-black bg-white"
          >
            <div className="border-b border-black px-4 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/45">
                Final step
              </p>
              <h2
                className="mt-1 [font-family:var(--font-editorial-title)] text-3xl font-bold"
                id="publishing-heading"
              >
                Publishing
              </h2>
            </div>

            <div className="space-y-5 p-4">
              <FormField
                error={getFieldError("status")}
                id="article-status"
                label="Status"
                required
              >
                <select
                  aria-invalid={Boolean(getFieldError("status"))}
                  className="article-form-control"
                  id="article-status"
                  name="status"
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as ArticleFormValues["status"],
                    )
                  }
                  required
                  value={values.status}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FormField>

              {isPublishing ? (
                <FormField
                  error={getFieldError("publishedAt")}
                  help="Leave empty to publish immediately."
                  id="article-published-at"
                  label="Publish date"
                >
                  <div className="relative">
                    <Clock3
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/45"
                      size={16}
                    />
                    <input
                      aria-invalid={Boolean(getFieldError("publishedAt"))}
                      className="article-form-control pl-10"
                      id="article-published-at"
                      name="publishedAt"
                      onBlur={() => validateField("publishedAt")}
                      onChange={(event) =>
                        updateField("publishedAt", event.currentTarget.value)
                      }
                      onInput={(event) =>
                        updateField("publishedAt", event.currentTarget.value)
                      }
                      type="datetime-local"
                      value={values.publishedAt}
                    />
                  </div>
                </FormField>
              ) : (
                <input
                  name="publishedAt"
                  type="hidden"
                  value={values.publishedAt}
                />
              )}

              <div className="border-t border-black/10 pt-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-black/48">
                  Publish readiness
                </p>
                <ul className="mt-3 space-y-2">
                  {readinessItems.map((item) => (
                    <li
                      className="flex items-center gap-2 text-xs"
                      key={item.label}
                    >
                      <span
                        className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full border ${
                          item.complete
                            ? "border-black bg-black text-white"
                            : "border-black/20 text-transparent"
                        }`}
                      >
                        <Check
                          aria-hidden="true"
                          size={10}
                          strokeWidth={2.5}
                        />
                      </span>
                      <span
                        className={
                          item.complete ? "text-black" : "text-black/48"
                        }
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-black bg-black px-4 text-sm font-semibold uppercase text-white outline-none transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-black/65 disabled:text-white"
                disabled={submitDisabled}
                type="submit"
              >
                {isPending || isSubmitLocked ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                    />
                    Saving…
                  </>
                ) : coverUploadState.isUploading ? (
                  "Uploading cover…"
                ) : isPublishing ? (
                  <>
                    <Send aria-hidden="true" size={16} />
                    {isEditing ? "Update & publish" : "Publish article"}
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" size={16} />
                    {isEditing ? "Update draft" : "Save draft"}
                  </>
                )}
              </button>
              <p className="text-center text-[0.7rem] leading-5 text-black/45">
                {isEditing
                  ? "Changes replace the stored article after validation."
                  : "You’ll review the stored article after saving."}
              </p>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-black bg-white/95 px-4 py-3 backdrop-blur-sm xl:hidden">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black/48">
            {isPublishing ? "Published" : "Draft"}
          </p>
          <p className="truncate text-sm font-semibold">
            {values.title || "Untitled article"}
          </p>
        </div>
        <button
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 border border-black bg-black px-4 text-xs font-semibold uppercase text-white outline-none transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitDisabled}
          type="submit"
        >
          {isPending || isSubmitLocked ? (
            <span
              aria-label="Saving"
              className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
            />
          ) : (
            <Save aria-hidden="true" size={15} />
          )}
          {isPending || isSubmitLocked
            ? "Saving"
            : isEditing
              ? "Save changes"
              : "Save article"}
        </button>
      </div>
    </form>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  action?: ReactNode;
  error?: string;
  help?: string;
  meta?: string;
  required?: boolean;
};

function FormField({
  id,
  label,
  children,
  action,
  error,
  help,
  meta,
  required = false,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-h-4 items-center justify-between gap-3">
        <label
          className="text-[0.68rem] font-semibold uppercase tracking-[0.1em]"
          htmlFor={id}
        >
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <div className="flex items-center gap-2">
          {meta ? (
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-black/42">
              {meta}
            </span>
          ) : null}
          {action}
        </div>
      </div>
      {children}
      {error ? (
        <p
          className="mt-2 text-xs leading-5 text-red-700"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : help ? (
        <p className="mt-2 text-xs leading-5 text-black/48">{help}</p>
      ) : null}
    </div>
  );
}

function focusFirstInvalidField(form: HTMLFormElement | null) {
  const invalidField = form?.querySelector<HTMLElement>(
    '[aria-invalid="true"]',
  );
  invalidField?.focus();
}

function useUnsavedChangesWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    function handleLinkClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || anchor.target === "_blank") {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
          destination.search === current.search &&
        destination.hash === current.hash
      ) {
        return;
      }

      const shouldLeave = window.confirm(
        "You have unsaved article changes. Leave this page?",
      );

      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [enabled]);
}
