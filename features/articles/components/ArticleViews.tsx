"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { trackArticleView } from "@/features/articles/lib/track-article-view";

const ViewCountContext = createContext<number | null>(null);

export function ArticleViewTracker({
  id,
  initialViews,
  children,
}: {
  id: string;
  initialViews: number;
  children: ReactNode;
}) {
  const [views, setViews] = useState(initialViews);
  useEffect(() => trackArticleView(id, setViews), [id]);
  return (
    <ViewCountContext.Provider value={views}>
      {children}
    </ViewCountContext.Provider>
  );
}

export function ArticleViewCount({ initialViews }: { initialViews: number }) {
  const views = useContext(ViewCountContext) ?? initialViews;
  return <span>{views.toLocaleString("en-US")} views</span>;
}
