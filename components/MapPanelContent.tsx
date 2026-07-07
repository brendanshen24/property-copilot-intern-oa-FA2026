"use client";

import type { Property } from "@/lib/types";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { bedroomLabel } from "./PropertyCard";

type MapPanelProps = {
  properties: Property[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  onViewportChange?: (bbox: string) => void;
  viewMode?: "list" | "map";
  resetBounds?: number;
  bbox?: string;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function MapPanelContent({ properties, activeId, onSelect, onViewportChange, viewMode, resetBounds, bbox }: MapPanelProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const prevPropertiesJson = useRef<string>("");
  const activeIdRef = useRef<string | null | undefined>(activeId);
  const lastUserInteractionRef = useRef<number>(0);
  const isResettingRef = useRef(false);
  const lastBboxRef = useRef<string | undefined>();

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Reset interaction timer when resetBounds is triggered (filter change)
  useEffect(() => {
    if (resetBounds) {
      isResettingRef.current = true;
    }
  }, [resetBounds]);

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

      // Handle viewport changes
      mapRef.current.on("moveend", () => {
        if (!mapRef.current || !onViewportChange) return;
        lastUserInteractionRef.current = Date.now();
        const bounds = mapRef.current.getBounds();
        if (!bounds) return;

        // Add a small buffer (approx 5%) to the bbox to ensure properties 
        // on the very edge are included and not cut off by the API filter
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const latDiff = ne.lat - sw.lat;
        const lngDiff = ne.lng - sw.lng;
        const buffer = 0.05; // 5% buffer

        const bbox = [
          sw.lat - latDiff * buffer,
          sw.lng - lngDiff * buffer,
          ne.lat + latDiff * buffer,
          ne.lng + lngDiff * buffer
        ].join(",");
        onViewportChange(bbox);
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
    const propertiesJson = JSON.stringify(properties.map(p => p.id).sort());
    const propertiesChanged = prevPropertiesJson.current !== propertiesJson;
    
    for (const property of properties) {
      if (!markers.has(property.id)) {
        const pinColor = getPinColor(property.rent);

        // Create marker element
        const el = document.createElement("div");
        el.className = "mapbox-marker";
        el.style.width = "60px";
        el.style.height = "60px";
        el.style.cursor = "pointer";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.innerHTML = `
          <div class="marker-content" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; transition: transform 0.1s ease;">
            <svg viewBox="0 0 24 26" width="40" height="44" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); overflow: visible;">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10z" 
                    fill="${pinColor}" 
                    stroke="white" 
                    stroke-width="1.5"/>
              <text x="12" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="white">$</text>
            </svg>
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el }).setLngLat([property.lng, property.lat]);
        
        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="padding: 4px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${property.title}</h3>
            <p style="font-size: 14px; margin-bottom: 2px;">$${property.rent.toLocaleString()}/mo</p>
            <p style="font-size: 12px; color: #666;">${bedroomLabel(property.bedrooms)} | ${property.bathrooms} ba</p>
          </div>
        `);
        marker.setPopup(popup);

        marker.getElement().addEventListener("click", () => onSelect?.(property.id));
        
        // Hover effects using direct DOM manipulation to avoid React re-renders
        const contentEl = el.querySelector(".marker-content") as HTMLDivElement;
        marker.getElement().addEventListener("mouseenter", () => {
          if (contentEl) contentEl.style.transform = "scale(1.2)";
          const popup = marker.getPopup();
          if (popup) popup.addTo(map);
        });
        marker.getElement().addEventListener("mouseleave", () => {
          if (contentEl && property.id !== activeIdRef.current) {
            contentEl.style.transform = "scale(1)";
            const popup = marker.getPopup();
            if (popup) popup.remove();
          }
        });

        marker.addTo(map);
        markers.set(property.id, marker);
      }

      bounds.extend([property.lng, property.lat]);
    }

    // Fit bounds if we have properties and they actually changed
    // If we're resetting (filter change), always fit bounds
    // Otherwise, skip if user just zoomed/panned in the last 1000ms to prevent auto-zoom loops
    const isResetting = isResettingRef.current;
    if (isResetting) {
      isResettingRef.current = false;
    }
    
    // Check if bbox changed - if it did, user panned, so don't fitBounds
    lastBboxRef.current = bbox;
    
    const timeSinceLastInteraction = Date.now() - lastUserInteractionRef.current;
    if (properties.length > 0 && !bounds.isEmpty() && propertiesChanged) {
      prevPropertiesJson.current = propertiesJson;
      
      // Only auto-fit if it's been a while since the user last moved the map manually,
      // or if this is a fresh filter reset.
      if (isResetting || timeSinceLastInteraction > 1500) {
        map.fitBounds(bounds, {
          padding: 60,
          maxZoom: 15,
          duration: isResetting ? 1000 : 0
        });
      }
    } else if (propertiesChanged) {
      prevPropertiesJson.current = propertiesJson;
    }
  }, [properties, onSelect, onViewportChange]);

  // Handle activeId separately
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.resize();
    }
  }, [viewMode]);

  // Handle activeId separately
  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map) return;

    for (const [id, marker] of markers) {
      const isActive = id === activeId;
      const el = marker.getElement();
      const contentEl = el.querySelector(".marker-content") as HTMLDivElement;

      if (contentEl) {
        const popup = marker.getPopup();
        if (isActive) {
          contentEl.style.transform = "scale(1.2)";
          if (popup) popup.addTo(map);
        } else {
          contentEl.style.transform = "scale(1)";
          if (popup) popup.remove();
        }
      }
    }
  }, [activeId]);

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

