"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

interface SortSelectProps {
  value: string;
  currentParams: Record<string, string | undefined>;
}

export default function SortSelect({ value, currentParams }: SortSelectProps) {
  const router = useRouter();

  const handleSortChange = (newSort: string) => {
    const sp = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (k !== "sort" && v) {
        sp.set(k, v);
      }
    });
    if (newSort) {
      sp.set("sort", newSort);
    }
    const query = sp.toString();
    router.push(query ? `/listings?${query}` : "/listings");
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-medium text-neutral-500">
        Sort:
      </label>

      <select
        id="sort-select"
        value={value}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-black"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
