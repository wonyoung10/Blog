"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBox({ placeholder = "검색" }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    router.push(params.toString() ? `?${params.toString()}` : window.location.pathname);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md items-center gap-2 rounded-md border border-[#d7cec0] bg-white px-3">
      <Search className="h-4 w-4 text-[#7d7469]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
    </form>
  );
}
