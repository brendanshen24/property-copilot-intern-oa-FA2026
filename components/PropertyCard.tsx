import type { Property } from "@/lib/types";
import { useEffect, useRef } from "react";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0
});

export function bedroomLabel(bedrooms: number): string {
  return bedrooms === 0 ? "Studio" : `${bedrooms} bd`;
}

type PropertyCardProps = {
  property: Property;
  active?: boolean;
  onSelect?: (id: string) => void;
};

export function PropertyCard({ property, active, onSelect }: PropertyCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (active && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [active]);

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white transition-all duration-300",
        active 
          ? "border-blue-600 shadow-md scale-[1.02] z-10" 
          : "border-gray-200 hover:border-blue-400 hover:shadow-lg",
        onSelect && "cursor-pointer"
      )}
      onClick={onSelect ? () => onSelect(property.id) : undefined}
    >
      {active && (
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-blue-600 z-20" />
      )}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-2 left-2">
          <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 backdrop-blur-sm">
            {property.propertyType}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">{CAD.format(property.rent)}<span className="text-xs font-normal text-gray-500">/mo</span></p>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-gray-400" />
            <span>{bedroomLabel(property.bedrooms)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-gray-400" />
            <span>{property.bathrooms} ba</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-3 w-3 text-gray-400" />
            <span>{property.squareFeet} sqft</span>
          </div>
        </div>

        <div className="flex items-start gap-1 text-sm text-gray-500">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
          <p className="line-clamp-1">
            {property.street}, {property.city}
          </p>
        </div>
      </div>
    </article>
  );
}
