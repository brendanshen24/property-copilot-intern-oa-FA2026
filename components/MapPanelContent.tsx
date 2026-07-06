"use client";

import type { Property } from "@/lib/types";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type MapPanelProps = {
  properties: Property[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function MapPanelContent({ properties, activeId, onSelect }: MapPanelProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-123.1207, 49.2827],
        zoom: 10
      });
    }

    const map = mapRef.current;
    const markers = markersRef.current;

    // Remove markers for properties no longer in list
    const currentIds = new Set(properties.map((p) => p.id));
    for (const [id, marker] of markers) {
      if (!currentIds.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }

    // Helper to determine pin color based on rent price
    const getPinColor = (rent: number): string => {
      if (rent < 1500) return "#10b981"; // green
      if (rent < 2000) return "#3b82f6"; // blue
      if (rent < 2500) return "#f59e0b"; // amber
      return "#ef4444"; // red
    };

    // Add or update markers
    const bounds = new mapboxgl.LngLatBounds();
    for (const property of properties) {
      if (!markers.has(property.id)) {
        const isActive = property.id === activeId;
        const pinColor = getPinColor(property.rent);

        // Create marker element
        const el = document.createElement("div");
        el.className = "mapbox-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.cursor = "pointer";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.innerHTML = `
          <svg viewBox="0 0 24 24" width="40" height="40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10z" 
                  fill="${pinColor}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <text x="12" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="white">$</text>
          </svg>
          ${isActive ? '<div style="position: absolute; inset: 0; border: 3px solid black; border-radius: 50%; transform: scale(1.5);"></div>' : ""}
        `;

        const marker = new mapboxgl.Marker({ element: el }).setLngLat([property.lng, property.lat]);
        marker.getElement().addEventListener("click", () => onSelect?.(property.id));
        marker.addTo(map);
        markers.set(property.id, marker);
      }

      bounds.extend([property.lng, property.lat]);
    }

    // Fit bounds if we have properties
    if (properties.length > 0 && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 });
    }

    // Update active marker styling
    for (const [id, marker] of markers) {
      const isActive = id === activeId;
      const el = marker.getElement();
      const ring = el.querySelector("div[style*='border']");

      if (isActive && !ring) {
        const ringEl = document.createElement("div");
        ringEl.style.position = "absolute";
        ringEl.style.inset = "0";
        ringEl.style.border = "3px solid black";
        ringEl.style.borderRadius = "50%";
        ringEl.style.transform = "scale(1.5)";
        el.appendChild(ringEl);
      } else if (!isActive && ring) {
        ring.remove();
      }
    }
  }, [properties, activeId, onSelect]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-red-300 bg-red-50">
        <p className="text-sm text-red-700">Mapbox token not configured. Set NEXT_PUBLIC_MAPBOX_TOKEN in .env</p>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-lg border border-gray-300 bg-gray-50" />
  );
}

