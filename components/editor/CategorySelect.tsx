"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ApiCategory = { id: string; name: string; slug: string };

type CategorySelectProps = {
  value: string;
  onChange: (name: string) => void;
  label?: string;
};

export default function CategorySelect({ value, onChange, label = "카테고리" }: CategorySelectProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ApiCategory[]) => {
        if (!cancelled && Array.isArray(data)) {
          setCategories(data.map((category) => category.name));
        }
      })
      .catch(() => {
        /* 목록 없이 동작 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    const list = query
      ? categories.filter((name) => name.toLowerCase().includes(query))
      : categories;
    return list.slice(0, 8);
  }, [categories, value]);

  const canCreate =
    value.trim().length > 0 &&
    !categories.some((name) => name.toLowerCase() === value.trim().toLowerCase());

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length > 0) {
        setOpen(true);
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length > 0) {
        setOpen(true);
        setActiveIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
      }
      return;
    }
    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < filtered.length) {
        event.preventDefault();
        select(filtered[activeIndex]);
      } else {
        setOpen(false);
      }
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="block text-sm font-bold text-[#53606d]" ref={containerRef}>
      <span>{label}</span>
      <div className="relative mt-1">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="선택하거나 새로 입력"
          className="h-10 w-full rounded-md border border-[#d7cec0] bg-white px-3 text-sm font-medium text-ink outline-none focus:border-moss"
        />

        {open && (filtered.length > 0 || canCreate) && (
          <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-[#d7cec0] bg-white py-1 shadow-soft">
            {filtered.map((name, index) => (
              <li key={name}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(name);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`block w-full px-3 py-1.5 text-left text-sm font-medium ${
                    index === activeIndex ? "bg-[#f1ece2] text-ink" : "text-[#53606d]"
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
            {canCreate && (
              <li>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(value.trim());
                  }}
                  className="block w-full px-3 py-1.5 text-left text-sm font-medium text-moss"
                >
                  새 카테고리 “{value.trim()}” 만들기
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
