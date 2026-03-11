/**
 * STATION IMAGE PROXY
 * Resizes, formats, and caches traffic camera and data images
 * for fire station display screens.
 */

// ============================================================
// CONFIGURATION
// CACHE_VERSION : Increment to immediately invalidate all
//                cached images across all displays
// STACK_GAP     : Pixel gap between vertically stacked images
// ============================================================
const CACHE_VERSION = 2;
const STACK_GAP     = 10;

// ============================================================
// LAYOUT DIMENSIONS
// Pixel dimensions for each display column layout.
// Do not change these values unless the display hardware changes.
// ============================================================
const LAYOUTS = {
  "wide":  { w: 1735, h: 720 }, // 1-column full-width layout
  "split": { w: 852,  h: 720 }, // 2-column layout (default)
  "tri":   { w: 558,  h: 720 }, // 3-column layout
  "full":   { w: 1920,  h: 1075 }, // full-screen layout
};

// ============================================================
// REFRESH RATES
// Cache TTL in seconds for each refresh key.
// ============================================================
const REFRESH_TIMES = {
  "fast":     300,  // 5 minutes  — for frequently changing cameras
  "moderate": 1200, // 20 minutes — for less frequently changing cameras
  "slow":     3600, // 1 hour     — for slowly updating data (river gauges etc.)
};

// ============================================================
// IMAGE MAPPING
// Maps short key names to source image URLs.
// Keys must be lowercase and use hyphens only.
// To add a new image, add a new entry following the existing format.
// ============================================================
const MAPPING = {

  // NOAA River Gauges
  "riverlevel-redriver": "https://water.noaa.gov/resources/hydrographs/fgon8_hg.png",

  // USGS River Images
  "river-redriver": "https://usgs-nims-images.s3.amazonaws.com/overlay/ND_Red_River_of_the_North_at_Fargo/ND_Red_River_of_the_North_at_Fargo_newest.jpg",

  // ND DOT Cameras — I-94
  "i94VeteransBlvd-south":   "https://www.dot.nd.gov/travel-info/cameras/I94@347.601Fargo9thStEWBSouth.jpg",
  "i94VeteransBlvd-east":    "https://www.dot.nd.gov/travel-info/cameras/I94RP347.565Fargo9thStEEBEast.jpg",
  "i9445thStS-south":        "https://www.dot.nd.gov/travel-info/cameras/I94RP348.602Fargo45thStSouth.jpg",
  "i9445thStS-east":         "https://www.dot.nd.gov/travel-info/cameras/I94RP348.602Fargo45thStEast.jpg",
  "i9445thStS-west":         "https://www.dot.nd.gov/travel-info/cameras/I94RP348.602Fargo45thStWest.jpg",
  "i9442ndStS-east":         "https://www.dot.nd.gov/travel-info/cameras/I94RP349.145Fargo42ndStSWBEast.jpg",
  "i9442ndStS-west":         "https://www.dot.nd.gov/travel-info/cameras/I94RP349.145Fargo42ndStSWBWest.jpg",
  "i29i94-north":            "https://www.dot.nd.gov/travel-info/cameras/fargotrilevelnorth.jpg",
  "i29i94-south":            "https://www.dot.nd.gov/travel-info/cameras/fargotrilevelsouth.jpg",
  "i94i29-east":             "https://www.dot.nd.gov/travel-info/cameras/fargotrileveleast.jpg",
  "i94i29-west":             "https://www.dot.nd.gov/travel-info/cameras/fargotrilevelwest.jpg",
  "i9425thStS-east":         "https://www.dot.nd.gov/travel-info/cameras/I94RP350.611Fargo25thStEast.jpg",
  "i9425thStS-west":         "https://www.dot.nd.gov/travel-info/cameras/I94RP350.603Fargo25thStWest.jpg",
  "i94UniversityDrS-east":   "https://www.dot.nd.gov/travel-info/cameras/I94RP351.617FargoUniversityDrEast.jpg",
  "i94UniversityDrS-west":   "https://www.dot.nd.gov/travel-info/cameras/I94RP351.617FargoUniversityDrWest.jpg",
  "i94RedRiver-east":        "https://www.dot.nd.gov/travel-info/cameras/I94RP352FargoRedRiverEast.jpg",
  "i94RedRiver-west":        "https://www.dot.nd.gov/travel-info/cameras/I94RP352FargoRedRiverWest.jpg",

  // ND DOT Cameras — I-29
  "i2970thAveS-north":  "https://www.dot.nd.gov/travel-info/cameras/I29RP58.765FargoSouthof64thAveSNorth.jpg",
  "i2970thAveS-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP58.765FargoSouthof64thAveSSouth.jpg",
  "i2952ndAveS-north":  "https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBNorth.jpg",
  "i2952ndAveS-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBSouth.jpg",
  "i2952ndAveS-east":   "https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBEast.jpg",
  "i2952ndAveS-west":   "https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBWest.jpg",
  "i2940thAveS-north":  "https://www.dot.nd.gov/travel-info/cameras/I29RP61.408Fargo40thAveNorth.jpg",
  "i2940thAveS-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP61.408Fargo40thAveSouth.jpg",
  "i2932ndAveS-north":  "https://www.dot.nd.gov/travel-info/cameras/I29RP62.627Fargo32ndAveSEastRampNorth.jpg",
  "i2932ndAveS-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP62.627Fargo32ndAveSEastRampSouth.jpg",
  "i2932ndAveS-west":   "https://www.dot.nd.gov/travel-info/cameras/I29RP62.627Fargo32ndAveSEastRampWest.jpg",
  "i2913thAveS-north":  "https://www.dot.nd.gov/travel-info/cameras/I29RP64.725FargoNorthof9thAveNorth.jpg",
  "i2913thAveS-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP64.135Fargo13thAveSSouth.jpg",
  "i29MainAve-north":   "https://www.dot.nd.gov/travel-info/cameras/I29RP65.272FargoMainAveSBNorth.jpg",
  "i29MainAve-south":   "https://www.dot.nd.gov/travel-info/cameras/I29RP65.272FargoMainAveSBSouth.jpg",
  "i297thAveN-south":   "https://www.dot.nd.gov/travel-info/cameras/I29RP65.741Fargo7thAveNSouth.jpg",
  "i2919thAveN-north":  "https://www.dot.nd.gov/travel-info/cameras/I29RP66.894Fargo19thAveNNorth.jpg",
  "i2919thAveN-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP66.894Fargo19thAveNSouth.jpg",
  "i2919thAveN-east":   "https://www.dot.nd.gov/travel-info/cameras/I29RP67.241Fargo19thAveNEastRampEast.jpg",
  "i2919thAveN-west":   "https://www.dot.nd.gov/travel-info/cameras/I29RP67.241Fargo19thAveNEastRampWest.jpg",
};


// ============================================================
// MAIN WORKER ENTRY POINT
// ============================================================
export default {
  async fetch(request, env) {
    const url      = new URL(request.url);
    const imgParam = url.searchParams.get("img");

    // Require the img parameter — return a clear error if missing
    if (!imgParam) {
      return new Response("Error: Missing required parameter: ?img=KEY", { status: 400 });
    }

    // Resolve layout and refresh rate, falling back to defaults if invalid values are passed
    const layoutKey  = url.searchParams.get("layout") || "split";
    const layout     = LAYOUTS[layoutKey] || LAYOUTS["split"];
    const refreshKey = url.searchParams.get("refresh") || "fast";
    const ttl        = REFRESH_TIMES[refreshKey] || REFRESH_TIMES["fast"];

    // Calculate a time bucket so all displays within the same refresh window
    // share the same cached image rather than generating separate upstream requests
    const bucket = Math.floor(Date.now() / 1000 / ttl);

    // Parse and normalise the img parameter — replace spaces with +,
    // split on +, trim whitespace, and discard any empty segments
    const keys      = imgParam.replace(/\s+/g, "+").split("+").map(k => k.trim()).filter(Boolean);
    const isStacked = keys.length > 1;

    // --------------------------------------------------------
    // STACKED IMAGE PATH — two images composited vertically
    // --------------------------------------------------------
    if (isStacked) {
      if (keys.length > 2) {
        return generateFallback(layout.w, layout.h, "MAX 2 IMAGES FOR STACKING");
      }

      const src1        = MAPPING[keys[0]];
      const src2        = MAPPING[keys[1]];
      const imageWidth  = layout.w;
      const imageHeight = (layout.h - STACK_GAP) / 2;
      const bottomY     = imageHeight + STACK_GAP;

      const compositeSvg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${layout.h}">` +
        `<rect width="100%" height="100%" fill="none"/>` +
        renderSlot(src1, 0, imageWidth, imageHeight, bucket) +
        renderSlot(src2, bottomY, imageWidth, imageHeight, bucket) +
        `</svg>`;

      return new Response(compositeSvg, {
        headers: {
          "Content-Type":  "image/svg+xml",
          "Cache-Control": `public, max-age=${ttl}, must-revalidate`,
        },
      });
    }

    // --------------------------------------------------------
    // SINGLE IMAGE PATH — fetch, resize, and return directly
    // --------------------------------------------------------
    const src = MAPPING[keys[0]];
    if (!src) return generateFallback(layout.w, layout.h, "CAMERA KEY NOT FOUND");

    const weservURL =
      `https://images.weserv.nl/?url=${encodeURIComponent(src)}` +
      `&w=${layout.w}&h=${layout.h}&fit=contain&bg=transparent` +
      `&v=${CACHE_VERSION}&time=${bucket}`;

    try {
      // Abort the upstream fetch if weserv doesn't respond within 5 seconds,
      // preventing the Worker from hanging until Cloudflare's 30s wall limit
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(weservURL, {
        signal:  controller.signal,
        headers: { "User-Agent": "FireStationDisplay/2.0" },
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Source Down");

      return new Response(res.body, {
        headers: {
          "Content-Type":    res.headers.get("content-type") || "image/jpeg",
          "Cache-Control":   `public, max-age=${ttl}, must-revalidate`,
          "X-System-Version": CACHE_VERSION.toString(),
        },
      });
    } catch (err) {
      return generateFallback(layout.w, layout.h);
    }
  },
};


// ============================================================
// RENDER SLOT
// Returns an SVG element for one image slot within a stacked
// composite. If the image key was not found in MAPPING, renders
// a styled error placeholder in its place.
// Defined at module level so it is not re-created on every request.
// ============================================================
function renderSlot(src, y, imageWidth, imageHeight, bucket) {
  if (src) {
    // Build the weserv URL and escape & as &amp; for valid SVG attribute syntax
    const weserv = (
      `https://images.weserv.nl/?url=${encodeURIComponent(src)}` +
      `&w=${imageWidth}&h=${imageHeight}&fit=contain&bg=transparent` +
      `&v=${CACHE_VERSION}&time=${bucket}`
    ).replaceAll("&", "&amp;");

    return `<image href="${weserv}" x="0" y="${y}" width="${imageWidth}" height="${imageHeight}" />`;
  }

  // Key not found — render an error placeholder in the slot
  const midY = y + imageHeight / 2;
  return (
    `<rect x="0" y="${y}" width="${imageWidth}" height="${imageHeight}" fill="#1a1a1a"/>` +
    `<text x="50%" y="${midY - 12}" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="sans-serif" font-weight="bold" font-size="28" fill="#e74c3c">CAMERA KEY NOT FOUND</text>` +
    `<text x="50%" y="${midY + 20}" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="sans-serif" font-size="18" fill="#bdc3c7">Check your image key</text>`
  );
}


// ============================================================
// GENERATE FALLBACK
// Returns a styled SVG error image for use when an image source
// is unavailable or an unrecoverable error has occurred.
// ============================================================
function generateFallback(width, height, customMsg = "IMAGE UNAVAILABLE") {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<rect width="100%" height="100%" fill="none"/>` +
    `<text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="sans-serif" font-weight="bold" font-size="32" fill="#e74c3c">${customMsg}</text>` +
    `<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="sans-serif" font-size="20" fill="#bdc3c7">Image will return shortly</text>` +
    `</svg>`;

  return new Response(svg, {
    status:  503,
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
