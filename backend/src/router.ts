import { filterProperties, parseFilter } from "./filter";
import { getPropertyById, listAllProperties, queryByBoundingBox } from "./properties";
import type { BoundingBox } from "./geo";

export type ApiRequest = {
  method: string;
  path: string;
  query: Record<string, string | undefined>;
};

export type ApiResponse = {
  statusCode: number;
  body: unknown;
};

/**
 * Parses a comma-separated bounding box string "minLat,minLng,maxLat,maxLng" into a BoundingBox object.
 */
function parseBoundingBox(bboxStr: string | undefined): BoundingBox | null {
  if (!bboxStr) return null;
  const parts = bboxStr.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;
  const [minLat, minLng, maxLat, maxLng] = parts;
  return { minLat, minLng, maxLat, maxLng };
}

/**
 * Framework-agnostic request router shared by the Lambda handler (production)
 * and the local dev server. Keeps the HTTP plumbing in one place so the same
 * logic runs in both environments.
 */
export async function route(req: ApiRequest): Promise<ApiResponse> {
  if (req.method !== "GET") {
    return { statusCode: 405, body: { error: "Method not allowed" } };
  }

  if (req.path === "/health") {
    return { statusCode: 200, body: { ok: true } };
  }

  // GET /properties/:id
  const detailMatch = req.path.match(/^\/properties\/([^/]+)$/);
  if (detailMatch) {
    const property = await getPropertyById(decodeURIComponent(detailMatch[1]));
    if (!property) {
      return { statusCode: 404, body: { error: "Property not found" } };
    }
    return { statusCode: 200, body: { property } };
  }

  // GET /properties
  //
  // Use viewport/bounding-box support if `bbox` is provided, otherwise fallback to
  // listAllProperties() (useful for initial load or non-map clients).
  if (req.path === "/properties") {
    const bbox = parseBoundingBox(req.query.bbox);
    const unfiltered = bbox 
      ? await queryByBoundingBox(bbox)
      : await listAllProperties();
    
    const properties = filterProperties(unfiltered, parseFilter(req.query));
    return { statusCode: 200, body: { properties, count: properties.length } };
  }

  return { statusCode: 404, body: { error: "Not found" } };
}
