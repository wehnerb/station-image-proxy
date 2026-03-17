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
const CACHE_VERSION = 3;
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

    // Only GET requests are valid for this Worker.
// All other HTTP methods are rejected immediately before any processing occurs.
if (request.method !== 'GET') {
  return new Response('Method Not Allowed', { status: 405, headers: { 'Allow': 'GET' } });
}
    
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
    // STACKED IMAGE PATH — two images composited vertically.
    // Both images are fetched server-side and embedded as base64
    // data URIs so the complete composite is cached by Cloudflare
    // as a single response. Display browsers never make direct
    // calls to images.weserv.nl for stacked images, eliminating
    // the rate limiting risk that existed when image URLs were
    // embedded in the SVG and fetched client-side.
    // --------------------------------------------------------
    if (isStacked) {
      if (keys.length > 2) {
        console.log("[station-image-proxy] Stacking error: too many keys (" + keys.length + ") requested");
        return generateFallback(layout.w, layout.h);
      }

      const src1        = MAPPING[keys[0]];
      const src2        = MAPPING[keys[1]];
      const imageWidth  = layout.w;
      const imageHeight = (layout.h - STACK_GAP) / 2;
      const bottomY     = imageHeight + STACK_GAP;

      // Fetch both images in parallel to minimise latency.
      // If either fetch returns null (source down or key not found),
      // an error placeholder is rendered in that slot instead.
      const [dataUri1, dataUri2] = await Promise.all([
        src1 ? fetchAsDataUri(src1, imageWidth, imageHeight, bucket) : Promise.resolve(null),
        src2 ? fetchAsDataUri(src2, imageWidth, imageHeight, bucket) : Promise.resolve(null),
      ]);

      // Build the composite SVG with embedded image data.
      // Each slot renders either the fetched image or an error
      // placeholder if the source was unavailable or key unknown.
      const slot1 = dataUri1
        ? "<image href=\"" + dataUri1 + "\" x=\"0\" y=\"0\" width=\"" + imageWidth + "\" height=\"" + imageHeight + "\" />"
        : renderErrorSlot(0, imageWidth, imageHeight, src1 ? "IMAGE UNAVAILABLE" : "CAMERA KEY NOT FOUND");

      const slot2 = dataUri2
        ? "<image href=\"" + dataUri2 + "\" x=\"0\" y=\"" + bottomY + "\" width=\"" + imageWidth + "\" height=\"" + imageHeight + "\" />"
        : renderErrorSlot(bottomY, imageWidth, imageHeight, src2 ? "IMAGE UNAVAILABLE" : "CAMERA KEY NOT FOUND");

      const compositeSvg =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + imageWidth + "\" height=\"" + layout.h + "\">" +
        "<rect width=\"100%\" height=\"100%\" fill=\"none\"/>" +
        slot1 +
        slot2 +
        "</svg>";

      return new Response(compositeSvg, {
        headers: {
          "Content-Type":          "image/svg+xml",
          "Cache-Control":         "public, max-age=" + ttl + ", must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // --------------------------------------------------------
    // SINGLE IMAGE PATH — fetch, resize, and return directly
    // --------------------------------------------------------
    const src = MAPPING[keys[0]];
    if (!src) {
  console.log(`[station-image-proxy] Unknown image key requested: "${keys[0]}"`);
  return generateFallback(layout.w, layout.h);
}

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
    "Content-Type":          res.headers.get("content-type") || "image/jpeg",
    "Cache-Control":         `public, max-age=${ttl}, must-revalidate`,
    "X-Content-Type-Options": "nosniff",
  },
});
    } catch (err) {
      return generateFallback(layout.w, layout.h);
    }
  },
};

// ============================================================
// FETCH AS DATA URI
// Fetches a single image from images.weserv.nl at the specified
// dimensions and returns it as a base64-encoded data URI string.
// Returns null if the fetch fails or times out, allowing the
// caller to render an error placeholder in its place.
//
// Fetching server-side and embedding as a data URI means the
// complete composite SVG (including image data) is cached by
// Cloudflare as a single response — display browsers never make
// direct calls to images.weserv.nl for stacked images, eliminating
// the rate limiting risk on stacked image requests.
// ============================================================
async function fetchAsDataUri(src, width, height, bucket) {
  const weservURL =
    "https://images.weserv.nl/?url=" + encodeURIComponent(src) +
    "&w=" + width + "&h=" + height + "&fit=contain&bg=transparent" +
    "&v=" + CACHE_VERSION + "&time=" + bucket;

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(weservURL, {
      signal:  controller.signal,
      headers: { "User-Agent": "FireStationDisplay/2.0" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer      = await res.arrayBuffer();

    // Convert ArrayBuffer to base64 using a safe byte-by-byte loop.
    // The spread operator (String.fromCharCode(...new Uint8Array(buffer)))
    // can overflow the call stack for large image buffers and must not be used.
    const bytes = new Uint8Array(buffer);
    let binary  = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return "data:" + contentType + ";base64," + btoa(binary);

  } catch (err) {
    return null;
  }
}

// ============================================================
// RENDER ERROR SLOT
// Returns an SVG error placeholder for one slot in a stacked
// composite, used when an image source is unavailable or the
// key was not found in MAPPING.
// Replaces the former renderSlot function, which combined both
// the valid-image and error-placeholder cases. Those cases are
// now handled separately: valid images are fetched server-side
// by fetchAsDataUri and embedded as data URIs; invalid or
// unavailable images fall through to this function.
// Defined at module level so it is not re-created on every request.
// ============================================================
function renderErrorSlot(y, imageWidth, imageHeight, message) {
  const midY = y + imageHeight / 2;
  return (
    "<rect x=\"0\" y=\"" + y + "\" width=\"" + imageWidth + "\" height=\"" + imageHeight + "\" fill=\"#1a1a1a\"/>" +
    "<text x=\"50%\" y=\"" + (midY - 12) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" " +
    "font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"28\" fill=\"#e74c3c\">" + message + "</text>" +
    "<text x=\"50%\" y=\"" + (midY + 20) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" " +
    "font-family=\"sans-serif\" font-size=\"18\" fill=\"#bdc3c7\">Check your image key</text>"
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

// SECURITY NOTE: customMsg is injected directly into SVG text content without escaping.
// This is safe as long as customMsg is only ever passed a hardcoded string literal from
// within this Worker. It must NEVER be populated with user-supplied input (e.g. a URL
// parameter value), an external API response, or any other value that cannot be fully
// trusted. Doing so would introduce an SVG/HTML injection vulnerability. If this function
// is ever extended to accept external input, all angle brackets, quotes, and ampersands
// in customMsg must be escaped before injection.
    
    `font-family="sans-serif" font-weight="bold" font-size="32" fill="#e74c3c">${customMsg}</text>` +
    `<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="sans-serif" font-size="20" fill="#bdc3c7">Image will return shortly</text>` +
    `</svg>`;

  return new Response(svg, {
  status:  503,
  headers: {
    "Content-Type":          "image/svg+xml",
    "Cache-Control":         "no-store",
    "X-Content-Type-Options": "nosniff",
  },
});
}
