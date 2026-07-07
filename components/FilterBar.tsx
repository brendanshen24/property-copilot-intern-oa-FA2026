"use client";

import type { PropertyFilter } from "@/lib/types";
import { useState } from "react";
import { ChevronDown, RotateCcw, Bed, Bath, DollarSign } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";
import { Slider } from "./ui/Slider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type FilterBarProps = {
  onFilterChange: (filter: PropertyFilter) => void;
  disabled?: boolean;
};

const BEDROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "Studio", value: 0 },
  { label: "1 bedroom", value: 1 },
  { label: "2 bedrooms", value: 2 },
  { label: "3+ bedrooms", value: 3 }
];

const BATHROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+ bathroom", value: 1 },
  { label: "2+ bathrooms", value: 2 },
  { label: "3+ bathrooms", value: 3 }
];

export function FilterBar({ onFilterChange, disabled }: FilterBarProps) {
  const [filter, setFilter] = useState<PropertyFilter>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 10000]);

  const handleFilterUpdate = (newFilter: PropertyFilter) => {
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange([min, max]);
    handleFilterUpdate({ 
      ...filter, 
      minRent: min === 1000 ? undefined : min, 
      maxRent: max === 10000 ? undefined : max 
    });
  };

  const handleBedroomChange = (bedrooms?: number) => {
    handleFilterUpdate({ ...filter, bedrooms });
  };

  const handleBathroomChange = (bathrooms?: number) => {
    handleFilterUpdate({ ...filter, bathrooms });
  };

  const handleReset = () => {
    setFilter({});
    setPriceRange([1000, 10000]);
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filter).some((v) => v !== undefined);

  const formatPrice = (price: number) => {
    if (price >= 10000) return "$10k+";
    return `$${price}`;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm min-h-[58px]">
      {/* Price Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex w-full lg:w-[190px] items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-50",
              (filter.minRent !== undefined || filter.maxRent !== undefined) 
                ? "border-blue-600 bg-blue-50 text-blue-700" 
                : "border-gray-200 text-gray-700"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {filter.minRent === undefined && filter.maxRent === undefined
                  ? "Price"
                  : `${formatPrice(filter.minRent || 0)} - ${formatPrice(filter.maxRent || 10000)}`}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Price Range</span>
              <span className="text-xs text-gray-500">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </span>
            </div>
            <Slider
              value={priceRange}
              min={1000}
              max={10000}
              step={100}
              onValueChange={setPriceRange}
              onValueCommit={handlePriceChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>$1,000</span>
              <span>$10,000+</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Bedrooms Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex w-full lg:w-[150px] items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-50",
              filter.bedrooms !== undefined 
                ? "border-blue-600 bg-blue-50 text-blue-700" 
                : "border-gray-200 text-gray-700"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Bed className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {filter.bedrooms === undefined
                  ? "Bedrooms"
                  : BEDROOM_OPTIONS.find(o => o.value === filter.bedrooms)?.label}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            {BEDROOM_OPTIONS.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => handleBedroomChange(option.value)}
                className={cn(
                  "rounded-md px-3 py-2 text-left text-sm transition-colors",
                  filter.bedrooms === option.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Bathrooms Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex w-full lg:w-[160px] items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-50",
              filter.bathrooms !== undefined 
                ? "border-blue-600 bg-blue-50 text-blue-700" 
                : "border-gray-200 text-gray-700"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Bath className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {filter.bathrooms === undefined
                  ? "Bathrooms"
                  : BATHROOM_OPTIONS.find(o => o.value === filter.bathrooms)?.label}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            {BATHROOM_OPTIONS.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => handleBathroomChange(option.value)}
                className={cn(
                  "rounded-md px-3 py-2 text-left text-sm transition-colors",
                  filter.bathrooms === option.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reset Button */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleReset}
          disabled={disabled}
          className="flex lg:ml-auto items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </motion.button>
      )}
    </div>
  );
}
