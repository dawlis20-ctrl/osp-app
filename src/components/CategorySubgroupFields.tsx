"use client";

import { useState } from "react";

const inputClass =
  "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

export function CategorySubgroupFields({
  categories,
}: {
  categories: { value: string; label: string }[];
}) {
  const [category, setCategory] = useState("SPRZET_RATOWNICZY");

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">
          Kategoria
        </label>
        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {category === "SPRZET_MEDYCZNY" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="subgroup" className="text-sm font-medium text-gray-700">
            Podkategoria
          </label>
          <select id="subgroup" name="subgroup" defaultValue="" className={inputClass}>
            <option value="">Pozostały sprzęt</option>
            <option value="R1">R1</option>
          </select>
        </div>
      )}
    </>
  );
}
