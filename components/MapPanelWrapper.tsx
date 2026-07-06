"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/lib/types";

type MapPanelProps = {
  properties: Property[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

// Dynamic import to avoid server-side rendering issues with browser-only libraries
const DynamicMapPanel = dynamic(
  () => import("./MapPanelContent").then((mod) => ({ default: mod.MapPanelContent })),
  {
    loading: () => (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-50">
        <p className="text-sm text-gray-600">Loading map…</p>
      </div>
    ),
    ssr: false
  }
);

export function MapPanelWrapper({ properties, activeId, onSelect }: MapPanelProps) {
  return <DynamicMapPanel properties={properties} activeId={activeId} onSelect={onSelect} />;
}

