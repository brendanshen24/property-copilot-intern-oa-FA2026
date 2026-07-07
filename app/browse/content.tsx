"use client";

import { useEffect, useState } from "react";
import { fetchProperties } from "@/lib/api";
import type { Property, PropertyFilter } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { MapPanelWrapper } from "@/components/MapPanelWrapper";
import { FilterBar } from "@/components/FilterBar";
import { motion } from "framer-motion";
import { Map as MapIcon, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "error" | "ready";
type ViewMode = "list" | "map";

export function BrowseContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PropertyFilter>({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Load properties when filter changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState(properties.length === 0 ? "loading" : "ready");
      setIsFiltering(true);
      try {
        const data = await fetchProperties(filter);
        if (!cancelled) {
          setProperties(data);
          setState("ready");
          // Clear activeId if the active property is no longer in results
          if (activeId && !data.some((p) => p.id === activeId)) {
            setActiveId(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listings");
          setState("error");
        }
      } finally {
        setIsFiltering(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const handleFilterChange = (newFilter: PropertyFilter) => {
    setFilter((prev) => ({ ...newFilter, bbox: prev.bbox }));
    setActiveId(null);
  };

  const handleViewportChange = (bbox: string) => {
    setFilter((prev) => ({ ...prev, bbox }));
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Browse rentals</h1>
        <p className="text-sm text-gray-600">
          Metro Vancouver listings. Filter by price, bedrooms, bathrooms, property type, and sync with the map.
        </p>
      </div>

      {state === "error" ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load listings: {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 relative">
        {/* Top: Filters */}
        <FilterBar onFilterChange={handleFilterChange} disabled={isFiltering} />

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden justify-center sticky top-2 z-50">
          <div className="flex bg-white rounded-full shadow-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <ListIcon className="h-4 w-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                viewMode === "map" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <MapIcon className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          {/* Left column: List */}
          <div className={cn(
            "space-y-4 min-h-[400px]",
            viewMode === "map" ? "hidden lg:block" : "block"
          )}>
            {state === "loading" ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[16/10] rounded-xl bg-gray-100" />
                  ))}
                </div>
              </div>
            ) : null}

            {state === "ready" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {properties.length === 0 ? (
                  <p className="text-sm text-gray-600">No listings match your filters.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      {properties.length} listing{properties.length === 1 ? "" : "s"}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {properties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          active={property.id === activeId}
                          onSelect={(id) => {
                            setActiveId(id);
                            if (window.innerWidth < 1024) {
                              setViewMode("map");
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>

          {/* Right column: Map */}
          <div className={cn(
            "lg:sticky lg:top-[5.5rem] lg:h-[calc(100vh-10rem)]",
            viewMode === "list" ? "hidden lg:block" : "block h-[calc(100vh-16rem)] min-h-[400px]"
          )}>
            <MapPanelWrapper 
              properties={properties} 
              activeId={activeId} 
              onSelect={setActiveId} 
              onViewportChange={handleViewportChange}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
