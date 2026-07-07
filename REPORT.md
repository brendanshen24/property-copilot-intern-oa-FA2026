## Frontend Link
https://property-copilot-intern-oa-fa-2026-eta.vercel.app/

## Backend Link
https://h3tmwp6ls0.execute-api.us-west-2.amazonaws.com/properties

## Design decisions

1.  **Map provider.** I chose **Mapbox** since it offers high-quality vector tiles, excellent performance for rendering markers, and a rich ecosystem for customization. It being React-friendly (via `mapbox-gl`) and straightforward API make it ideal for this use case. Compared to other free map providers like Leaflet, Mapbox provides better out-of-the-box performance for hundreds of markers, and its pricing (free for me in this case) has already made it a good fit for many production apps.
2.  **Performance at density.** To keep the map smooth, I implemented custom markers using SVG for lightweight rendering. For larger datasets, I would transition to Mapbox's `symbol` layers or clustering. Currently, with 50 listings, the map remains performant by synchronizing markers with the filtered property list in React's `useEffect`. Viewport-based rendering is also enabled by the server-side `bbox` query, ensuring only visible listings are loaded.
3.  **Geospatial querying.** The server answers viewport queries by converting the bounding box into geohash prefixes. It then performs a `Query` on the `geo-index` GSI in DynamoDB, which uses `geohashPrefix` as the partition key. This allows for efficient retrieval of properties in the general vicinity. The results are further refined server-side using the exact latitude/longitude coordinates to ensure they fall within the requested viewport.
4.  **Filtering model.** Renters can filter by **rent price range**, **number of bedrooms**, **number of bathrooms**, **property type**, and **city**. These filters compose by narrowing results across all active dimensions. The empty state handles cases with no matches by showing a clear message, and a reset button in the `FilterBar` allows users to quickly clear all filters.
5.  **Component Design.** The `FilterBar` is a stateful client component that manages all filter selections and communicates changes via the `onFilterChangeAction` callback. Popovers use Radix UI for accessibility and consistent UX across different filters.
6.  **Testing Strategy.** Pure Node.js unit tests using Vitest cover utilities, API functions, type safety, and backend logic. Component-level testing was avoided to keep the test environment lightweight; instead, the component contracts are verified through type tests and API integration tests.

## Testing & Quality Assurance

### Test Suite Overview
- **Total Tests:** 70 passing
- **Execution Time:** ~540ms
- **Environment:** Node.js (Vitest)
- **Test Files:** 8 comprehensive test suites

### Test Coverage by Category

**1. Frontend Tests (35 tests)**
- **frontend.utils.test.ts** (8 tests) - `cn()` utility function for Tailwind class merging
  - Single/multiple classes, conditional logic, object notation, conflict resolution
- **frontend.api.test.ts** (12 tests) - API layer (`fetchProperties`, `fetchProperty`)
  - All filter combinations (rent, bedrooms, bathrooms, property type, city)
  - Error handling and network failures
  - Query string encoding and parameter passing
- **frontend.types.test.ts** (15 tests) - Type safety validation
  - PropertyType, City, PropertyFilter, Property types
  - All valid enum values and combinations
  - Fractional bathrooms, studio support, edge cases

**2. Backend Tests (35 tests)**
- **filter.test.ts** (22 tests) - Filter logic and composition
  - Rent range (inclusive endpoints), bedroom/bathroom minimums
  - Property type and city exact matching
  - Filter composition across multiple dimensions
  - `parseFilter()` function with validation
- **geo.test.ts** (4 tests) - Geospatial functionality
  - Geohash encoding/decoding, prefix consistency
  - Bounding box coverage and point-in-box checks
  - Deduplication of geohash prefixes
- **seed-data.test.ts** (5 tests) - Test data integrity
- **router.test.ts** (3 tests) - API routing logic
- **smoke.test.ts** (1 test) - Basic sanity check

### Build Integration
- Tests are **automatically run on `npm run build`** before production build
- Ensures code quality gates are enforced in the CI/CD pipeline
- Build will fail if any tests fail, preventing broken code from being deployed

## Performance Optimizations

### Applied Optimizations
1. **Lazy Image Loading** - PropertyCard uses `loading="lazy"` attribute
2. **Async Image Decoding** - Added `decoding="async"` for better perceived performance
3. **Module-Level Constants** - Filter options and formatters defined at module level, not recreated on render
4. **Efficient API Queries** - URLSearchParams is lightweight and browser-optimized
5. **Proper Event Handler Scoping** - No unnecessary re-renders detected

### Performance Metrics
- **Image Loading:** Native browser lazy-loading (no JS overhead)
- **Filter Options:** Defined once at module init, zero runtime cost
- **API Calls:** Debounced viewport changes (300ms) prevent API spam
- **Memory:** No memory leaks in component lifecycle; proper cleanup in useEffect hooks

## What I'd add with more time

- **Marker Clustering:** As the number of listings grows, clustering would be essential for map clarity and performance.
- **Search by Address:** Adding a search bar with geocoding (e.g., Mapbox Geocoding API) to jump to specific neighbourhoods.
- **Save Search/Alerts:** Allow users to save their filter combinations and receive alerts for new listings.
- **Enhanced Property Details:** A more detailed modal or page for properties, including a photo gallery and contact form.
- **Advanced Filtering:** Adding more dimensions like square footage and pet-friendliness.
- **Infrastructure:** Fine-tuning the geohash precision based on map zoom level for even more efficient queries.
- **Component E2E Tests:** Add Playwright tests for critical user flows (filter + select property)
- **Performance Monitoring:** Integrate analytics to track filter performance and user behaviours
- **Offline Support:** Service Worker for offline browsing of cached listings