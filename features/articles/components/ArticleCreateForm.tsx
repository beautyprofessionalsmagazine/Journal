"use client";

import { type ReactNode, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { categoryConfigs } from "@/features/categories/data/categories";
import { CoverImageUploader } from "@/features/articles/components/CoverImageUploader";
import { createArticleAction } from "@/features/articles/server/article-actions";
import {
  emptyCreateArticleFormValues,
  initialCreateArticleFormState,
} from "@/features/articles/types/article";

export function ArticleCreateForm() {
  const [state, formAction] = useActionState(
    createArticleAction,
    initialCreateArticleFormState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="flex flex-col gap-6">
        <Field error={state.fieldErrors.title} label="Title" required>
          <input
            aria-invalid={Boolean(state.fieldErrors.title)}
            className="input-control"
            defaultValue={emptyCreateArticleFormValues.title}
            name="title"
          />
        </Field>
        <Field error={state.fieldErrors.slug} label="Slug" required>
          <input
            aria-invalid={Boolean(state.fieldErrors.slug)}
            className="input-control"
            defaultValue={emptyCreateArticleFormValues.slug}
            name="slug"
            placeholder="summer-skin-pro-guide"
          />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field error={state.fieldErrors.category} label="Category" required>
            <select
              aria-invalid={Boolean(state.fieldErrors.category)}
              className="input-control"
              defaultValue={emptyCreateArticleFormValues.category}
              name="category"
            >
              {categoryConfigs.map((category) => (
                <option key={category.slug} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field error={state.fieldErrors.author} label="Author" required>
            <input
              aria-invalid={Boolean(state.fieldErrors.author)}
              className="input-control"
              defaultValue={emptyCreateArticleFormValues.author}
              name="author"
            />
          </Field>
        </div>
        <Field error={state.fieldErrors.description} label="Description">
          <textarea
            aria-invalid={Boolean(state.fieldErrors.description)}
            className="input-control min-h-28"
            defaultValue={emptyCreateArticleFormValues.description}
            name="description"
          />
        </Field>
        <Field error={state.fieldErrors.contentJson} label="Content JSON">
          <textarea
            aria-invalid={Boolean(state.fieldErrors.contentJson)}
            className="input-control min-h-[28rem] [font-family:ui-monospace,SFMono-Regular,Consolas,monospace] text-sm leading-7"
            defaultValue={emptyCreateArticleFormValues.contentJson}
            name="contentJson"
            placeholder={'{"blocks":[{"type":"paragraph","text":"Start writing here."}]}'}
          />
        </Field>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Publish
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <Field error={state.fieldErrors.status} label="Status" required>
              <select
                aria-invalid={Boolean(state.fieldErrors.status)}
                className="input-control"
                defaultValue={emptyCreateArticleFormValues.status}
                name="status"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field error={state.fieldErrors.tags} label="Tags">
              <input
                aria-invalid={Boolean(state.fieldErrors.tags)}
                className="input-control"
                defaultValue={emptyCreateArticleFormValues.tags}
                name="tags"
                placeholder="editorial, skincare, backstage"
              />
            </Field>
            <SubmitButton />
            {state.message ? (
              <p className="border border-black/15 p-3 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                {state.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Cover
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <CoverImageUploader error={state.fieldErrors.coverImage} />
            <Field error={state.fieldErrors.coverImageAlt} label="Cover image alt text">
              <textarea
                aria-invalid={Boolean(state.fieldErrors.coverImageAlt)}
                className="input-control min-h-28"
                defaultValue={emptyCreateArticleFormValues.coverImageAlt}
                name="coverImageAlt"
                placeholder="Describe the cover image for accessibility."
              />
            </Field>
          </div>
        </div>
      </aside>
    </form>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

function Field({ label, error, required = false, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 [font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error ? (
        <span className="[font-family:var(--font-editorial-body-sans)] text-xs italic normal-case text-black/62">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="border border-black bg-black px-5 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-black/30 disabled:bg-black/80"
      disabled={pending}
      type="submit"
    >
      {pending ? "Creating..." : "Create article"}
    </button>
  );
}
