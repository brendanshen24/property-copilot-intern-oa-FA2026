"use client";

import type { PropertyFilter } from "@/lib/types";
import { useState } from "react";

type FilterBarProps = {
  onFilterChange: (filter: PropertyFilter) => void;
  disabled?: boolean;
};

const RENT_PRESETS = [
  { label: "Any price", min: undefined, max: undefined },
  { label: "$0 - $1500", min: 0, max: 1500 },
  { label: "$1500 - $2500", min: 1500, max: 2500 },
  { label: "$2500+", min: 2500, max: undefined }
];

const BEDROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "Studio", value: 0 },
  { label: "1 bed", value: 1 },
  { label: "2 bed", value: 2 },
  { label: "3+ bed", value: 3 }
];

const BATHROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 }
];

export function FilterBar({ onFilterChange, disabled }: FilterBarProps) {
  const [filter, setFilter] = useState<PropertyFilter>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleFilterUpdate = (newFilter: PropertyFilter) => {
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleRentChange = (min?: number, max?: number) => {
    handleFilterUpdate({ ...filter, minRent: min, maxRent: max });
  };

  const handleBedroomChange = (bedrooms?: number) => {
    handleFilterUpdate({ ...filter, bedrooms });
  };

  const handleBathroomChange = (bathrooms?: number) => {
    handleFilterUpdate({ ...filter, bathrooms });
  };

  const handleReset = () => {
    setFilter({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filter).some((v) => v !== undefined);

  const currentRentLabel = RENT_PRESETS.find(
    (p) => p.min === filter.minRent && p.max === filter.maxRent
  )?.label;

  const currentBedroomLabel = BEDROOM_OPTIONS.find((o) => o.value === filter.bedrooms)?.label;
  const currentBathroomLabel = BATHROOM_OPTIONS.find((o) => o.value === filter.bathrooms)?.label;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            disabled={disabled}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Price Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => setExpandedSection(expandedSection === "price" ? null : "price")}
            disabled={disabled}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-600 disabled:text-gray-400"
          >
            <span>Price {currentRentLabel && `· ${currentRentLabel}`}</span>
            <span className="text-xs">{expandedSection === "price" ? "−" : "+"}</span>
          </button>
          {expandedSection === "price" && (
            <div className="mt-3 space-y-2">
              {RENT_PRESETS.map((preset) => (
                <label key={preset.label} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rent"
                    checked={preset.min === filter.minRent && preset.max === filter.maxRent}
                    onChange={() => handleRentChange(preset.min, preset.max)}
                    disabled={disabled}
                    className="cursor-pointer"
                  />
                  <span>{preset.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Bedrooms Filter */}
        <div className="border-b border-gray-100 pb-3">
          <button
            onClick={() => setExpandedSection(expandedSection === "bedrooms" ? null : "bedrooms")}
            disabled={disabled}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-600 disabled:text-gray-400"
          >
            <span>Bedrooms {currentBedroomLabel && currentBedroomLabel !== "Any" && `· ${currentBedroomLabel}`}</span>
            <span className="text-xs">{expandedSection === "bedrooms" ? "−" : "+"}</span>
          </button>
          {expandedSection === "bedrooms" && (
            <div className="mt-3 space-y-2">
              {BEDROOM_OPTIONS.map((option) => (
                <label key={String(option.value)} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="bedrooms"
                    checked={option.value === filter.bedrooms}
                    onChange={() => handleBedroomChange(option.value)}
                    disabled={disabled}
                    className="cursor-pointer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Bathrooms Filter */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === "bathrooms" ? null : "bathrooms")}
            disabled={disabled}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-600 disabled:text-gray-400"
          >
            <span>Bathrooms {currentBathroomLabel && currentBathroomLabel !== "Any" && `· ${currentBathroomLabel}`}</span>
            <span className="text-xs">{expandedSection === "bathrooms" ? "−" : "+"}</span>
          </button>
          {expandedSection === "bathrooms" && (
            <div className="mt-3 space-y-2">
              {BATHROOM_OPTIONS.map((option) => (
                <label key={String(option.value)} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="bathrooms"
                    checked={option.value === filter.bathrooms}
                    onChange={() => handleBathroomChange(option.value)}
                    disabled={disabled}
                    className="cursor-pointer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
