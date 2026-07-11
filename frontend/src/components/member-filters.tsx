"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "ALL", label: "Alle Branchen" },
  { value: "HANDWERK", label: "Handwerk" },
  { value: "DIENSTLEISTUNG", label: "Dienstleistung" },
  { value: "GASTRONOMIE", label: "Gastronomie" },
  { value: "HANDEL", label: "Handel" },
  { value: "INDUSTRIE", label: "Industrie" },
  { value: "FREIE_BERUFE", label: "Freie Berufe" },
];

export function MemberFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateSearchDebounced(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("search", value ?? ""), 350);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Input
        placeholder="Unternehmen suchen…"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateSearchDebounced(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("category") ?? "ALL"}
        onValueChange={(value) => updateParam("category", value ?? "ALL")}
      >
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="Branche" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
