"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { categoryConfigs } from "@/features/articles/data/categories";
import type {
  Article,
  ArticleCategory,
  ArticleStatus,
} from "@/features/articles/types/article.types";

type AdminArticleFormProps = {
  article?: Article;
};

type FormState = {
  title: string;
  slug: string;
  subtitle: string;
  annotation: string;
  author: string;
  publishedAt: string;
  photographer: string;
  editorNote: string;
  category: ArticleCategory;
  subcategory: string;
  tags: string;
  coverImage: string;
  body: string;
  pullQuote: string;
  status: ArticleStatus;
  featured: boolean;
};

export function AdminArticleForm({ article }: AdminArticleFormProps) {
  const [form, setForm] = useState<FormState>(() => ({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    subtitle: article?.subtitle ?? "",
    annotation: article?.annotation ?? "",
    author: article?.author ?? "",
    publishedAt: article?.publishedAt ?? new Date().toISOString().slice(0, 10),
    photographer: article?.photographer ?? "",
    editorNote: article?.editorNote ?? "",
    category: article?.category ?? "Beauty",
    subcategory: article?.subcategory ?? "Nails",
    tags: article?.tags.join(", ") ?? "",
    coverImage: article?.coverImage ?? "/images/journal-bg.PNG",
    body:
      article?.body
        .map((block) => {
          if (block.type === "question") {
            return `Q: ${block.text}`;
          }

          if (block.type === "answer") {
            return `A: ${block.text}`;
          }

          if (block.type === "heading") {
            return `## ${block.text}`;
          }

          return block.text;
        })
        .join("\n\n") ?? "",
    pullQuote: article?.pullQuotes[0] ?? "",
    status: article?.status ?? "draft",
    featured: article?.featured ?? false,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const selectedCategory = categoryConfigs.find(
    (item) => item.name === form.category,
  );

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.slug.trim()) {
      nextErrors.slug = "Slug is required.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      nextErrors.slug = "Use lowercase letters, numbers, and hyphens.";
    }

    if (!form.author.trim()) {
      nextErrors.author = "Author is required.";
    }

    if (!form.body.trim()) {
      nextErrors.body = "Article body is required.";
    }

    setErrors(nextErrors);
    setSaved(Object.keys(nextErrors).length === 0);
  }

  return (
    <form className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <Field
          error={errors.title}
          label="Title"
          required
        >
          <input
            aria-invalid={Boolean(errors.title)}
            className="input-control"
            onChange={(event) => updateField("title", event.target.value)}
            value={form.title}
          />
        </Field>
        <Field error={errors.slug} label="Slug" required>
          <input
            aria-invalid={Boolean(errors.slug)}
            className="input-control"
            onChange={(event) => updateField("slug", event.target.value)}
            value={form.slug}
          />
        </Field>
        <Field label="Subtitle 1">
          <input
            className="input-control"
            onChange={(event) => updateField("subtitle", event.target.value)}
            value={form.subtitle}
          />
        </Field>
        <Field label="Subtitle 2 / annotation">
          <textarea
            className="input-control min-h-28"
            onChange={(event) => updateField("annotation", event.target.value)}
            value={form.annotation}
          />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field error={errors.author} label="Author" required>
            <input
              aria-invalid={Boolean(errors.author)}
              className="input-control"
              onChange={(event) => updateField("author", event.target.value)}
              value={form.author}
            />
          </Field>
          <Field label="Date">
            <input
              className="input-control"
              onChange={(event) => updateField("publishedAt", event.target.value)}
              type="date"
              value={form.publishedAt}
            />
          </Field>
        </div>
        <Field label="Photographer">
          <input
            className="input-control"
            onChange={(event) => updateField("photographer", event.target.value)}
            value={form.photographer}
          />
        </Field>
        <Field label="Editor note">
          <textarea
            className="input-control min-h-28"
            onChange={(event) => updateField("editorNote", event.target.value)}
            value={form.editorNote}
          />
        </Field>
        <Field error={errors.body} label="Article body" required>
          <textarea
            aria-invalid={Boolean(errors.body)}
            className="input-control min-h-96 [font-family:var(--font-editorial-body-serif)] text-lg leading-8"
            onChange={(event) => updateField("body", event.target.value)}
            value={form.body}
          />
        </Field>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Publishing
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <Field label="Status">
              <select
                className="input-control"
                onChange={(event) =>
                  updateField("status", event.target.value as ArticleStatus)
                }
                value={form.status}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase">
              <input
                checked={form.featured}
                className="size-5 accent-black"
                onChange={(event) => updateField("featured", event.target.checked)}
                type="checkbox"
              />
              Featured article
            </label>
            <button
              className="border border-black bg-black px-5 py-3 [font-family:var(--font-editorial-sans)] text-sm font-semibold uppercase text-white transition hover:bg-white hover:text-black"
              type="submit"
            >
              {article ? "Save changes" : "Create article"}
            </button>
            {saved ? (
              <p className="border border-black/15 p-3 [font-family:var(--font-editorial-body-sans)] text-sm italic text-black/62">
                Validation passed. Persistence will be connected later.
              </p>
            ) : null}
          </div>
        </div>
        <div className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Taxonomy
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <Field label="Category">
              <select
                className="input-control"
                onChange={(event) =>
                  updateField("category", event.target.value as ArticleCategory)
                }
                value={form.category}
              >
                {categoryConfigs.map((item) => (
                  <option key={item.slug} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory">
              <select
                className="input-control"
                onChange={(event) => updateField("subcategory", event.target.value)}
                value={form.subcategory}
              >
                {(selectedCategory?.subcategories.length
                  ? selectedCategory.subcategories
                  : ["General"]
                ).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tags">
              <input
                className="input-control"
                onChange={(event) => updateField("tags", event.target.value)}
                value={form.tags}
              />
            </Field>
          </div>
        </div>
        <div className="border border-black/15 p-5">
          <h2 className="[font-family:var(--font-editorial-title)] text-3xl font-bold">
            Media
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            <Field label="Cover image">
              <input
                className="input-control"
                onChange={(event) => updateField("coverImage", event.target.value)}
                value={form.coverImage}
              />
            </Field>
            <Field label="Pull quote">
              <textarea
                className="input-control min-h-28"
                onChange={(event) => updateField("pullQuote", event.target.value)}
                value={form.pullQuote}
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
