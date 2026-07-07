"use client";

import React from "react";

const legendItems = [
  { color: "#3b82f6", label: "$1,500 - $1,999" },
  { color: "#f59e0b", label: "$2,000 - $2,499" },
  { color: "#ef4444", label: "≥ $2,500" },
];

export function MapLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-[8.5px] px-1">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color, border: "1px solid rgba(0,0,0,0.1)" }}
          />
          <span className="text-xs font-medium text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
