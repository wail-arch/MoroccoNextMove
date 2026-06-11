"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin, X } from "lucide-react";
import { cn } from "@/lib/cn";

/*
 * Accessible combobox over the seeded places. The traveler's actual riad
 * won't be in the list — when a search has no exact match, the picker
 * surfaces the accommodation areas with an honest explainer instead of an
 * empty dropdown. Selection lands in a hidden input, so the surrounding
 * GET form keeps its URL-addressable contract.
 */

export interface PickerPlace {
  id: string;
  label: string;
  cityLabel: string;
  /** Accommodation areas are the fallback suggestion for unknown places. */
  isArea: boolean;
  /** Pre-normalized haystack: names in all locales + aliases. */
  searchText: string;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const MAX_RESULTS = 8;

export function PlacePicker({
  name,
  label,
  places,
  initialId,
}: {
  name: string;
  label: string;
  places: PickerPlace[];
  initialId?: string;
}) {
  const t = useTranslations("move");
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = places.find((p) => p.id === initialId);
  const [selected, setSelected] = useState<PickerPlace | null>(initial ?? null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const trimmed = normalize(query.trim());
  const { results, isFallback } = useMemo(() => {
    if (!trimmed) {
      return { results: places.slice(0, MAX_RESULTS), isFallback: false };
    }
    const matches = places.filter((p) => p.searchText.includes(trimmed));
    if (matches.length > 0) {
      return { results: matches.slice(0, MAX_RESULTS), isFallback: false };
    }
    return {
      results: places.filter((p) => p.isArea).slice(0, MAX_RESULTS),
      isFallback: true,
    };
  }, [places, trimmed]);

  function choose(place: PickerPlace) {
    setSelected(place);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (open && results[highlighted]) {
        event.preventDefault();
        choose(results[highlighted]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
        {label}
      </span>
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={selected ? selected.label : query}
          placeholder={t("searchPlace")}
          onChange={(e) => {
            if (selected) setSelected(null);
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Let option mousedown fire before closing.
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={onKeyDown}
          className="h-12 w-full rounded-xl border border-line bg-card pe-10 ps-3 text-sm font-medium text-ink outline-none focus:border-zellige"
        />
        {selected ? (
          <button
            type="button"
            onClick={clear}
            aria-label={t("pickPlace")}
            className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          />
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-line bg-card shadow-lg">
          {isFallback && (
            <p className="border-b border-line bg-saffron-soft px-3 py-2 text-[12px] leading-5 text-ink">
              <span className="font-semibold">{t("noMatches")}</span>{" "}
              {t("unknownPlaceHint")}
            </p>
          )}
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.map((place, i) => (
              <li
                key={place.id}
                role="option"
                aria-selected={i === highlighted}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(place);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 px-3 py-2.5",
                  i === highlighted && "bg-zellige-soft",
                )}
              >
                <MapPin
                  className={cn(
                    "h-4 w-4 shrink-0",
                    place.isArea ? "text-terracotta" : "text-zellige",
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {place.label}
                  </span>
                  <span className="block text-[11px] text-ink-faint">
                    {place.cityLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
