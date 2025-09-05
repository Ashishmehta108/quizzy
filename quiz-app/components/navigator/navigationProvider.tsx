"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { appRoutes } from "@/lib/routes";

type SearchRoute = (typeof appRoutes)[number] & { pathClean?: string };

const buildIndex = (routes: SearchRoute[]) =>
  routes.map((r) => ({ ...r, pathClean: r.path.replace(/^\//, "") }));

const fuse = new Fuse(buildIndex(appRoutes), {
  keys: ["title", "pathClean", "description"],
  threshold: 0.4,
  ignoreLocation: true,
});

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results: SearchRoute[] =
    query.trim().length > 0
      ? fuse
          .search(query)
          .map((r) => r.item)
          .slice(0, 6)
      : buildIndex(appRoutes).slice(0, 6);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const best = results.length > 0 ? results[0] : null;
  const normalizedQuery = query.replace(/^\//, "").toLowerCase();
  const suggestionSource = best
    ? best.title ?? best.pathClean ?? best.path.replace(/^\//, "")
    : "";
  const suggestionSourceLower = suggestionSource.toLowerCase();
  const showInlineSuggestion =
    normalizedQuery.length > 0 &&
    suggestionSourceLower.startsWith(normalizedQuery);
  const suggestionRest = showInlineSuggestion
    ? suggestionSource.slice(normalizedQuery.length)
    : "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex] ?? best;
      if (target) selectRoute(target.path);
    }
    if (e.key === "Tab") {
      if (showInlineSuggestion && best) {
        e.preventDefault();
        selectRoute(best.path);
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectRoute = (path: string) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    router.push(path);
  };

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          'input[placeholder="Search routes..."]'
        );
        el?.focus();
        if (el) {
          const val = el.value;
          el.setSelectionRange(val.length, val.length);
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className=" ">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md dark:bg-zinc-900/70"
            aria-hidden
          />

          <div className="relative w-full max-w-2xl mx-auto pointer-events-auto">
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/90">
              {/* Input + inline suggestion */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 relative">
                <CommandInput
                  placeholder="Search routes..."
                  value={query}
                  onValueChange={(v) => setQuery(v)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-transparent caret-zinc-800 dark:caret-white placeholder:text-zinc-400 focus:outline-none "
                />

                {/* Inline suggestion overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center px-4 font-mono">
                  <span className="text-zinc-900 dark:text-zinc-100 pl-10">
                    {query}
                  </span>
                  {suggestionRest && (
                    <span className="text-zinc-400 dark:text-zinc-500 ">
                      {suggestionRest}
                    </span>
                  )}
                </div>

                {showInlineSuggestion && best && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400">
                    ↹ Tab to go{" "}
                    <span className="font-medium">{suggestionSource}</span>
                  </div>
                )}
              </div>

              <CommandList className="max-h-80 overflow-auto">
                <CommandEmpty className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No results found.
                </CommandEmpty>

                <CommandGroup heading="Navigation" className="px-1 py-1">
                  {results.map((route, idx) => (
                    <CommandItem
                      key={route.path}
                      onSelect={() => selectRoute(route.path)}
                      className={`flex flex-col px-4 py-3 gap-1 cursor-pointer transition-colors ${
                        idx === activeIndex
                          ? "bg-zinc-100 dark:bg-zinc-800"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/70"
                      }`}
                    >
                      <div className="flex items-center w-full justify-between gap-3">
                        <div className="flex  gap-3">
                          <div className="w-8 h-8 rounded-md bg-zinc-200 text-zinc-800 flex items-center justify-center text-xs dark:bg-zinc-700 dark:text-zinc-100">
                            {route.title?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {route.title}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {route.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-zinc-400">
                          {route.path}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
