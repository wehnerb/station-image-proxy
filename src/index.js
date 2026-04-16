/**
 * STATION IMAGE PROXY
 * Renders traffic camera and data images for fire station
 * display screens as HTML pages, scaled via CSS.
 * Images are fetched directly by the display browser —
 * no external image processing service is required.
 */

// ============================================================
// CONFIGURATION
// STACK_GAP : Pixel gap between vertically stacked images
// ============================================================
const STACK_GAP = 10;

// ============================================================
// LAYOUT DIMENSIONS
// Pixel dimensions for each display column layout.
// Do not change these values unless the display hardware changes.
// ============================================================
const LAYOUTS = {
  "wide":  { w: 1735, h: 720  }, // 1-column full-width layout
  "split": { w: 852,  h: 720  }, // 2-column layout (default)
  "tri":   { w: 558,  h: 720  }, // 3-column layout
  "full":  { w: 1920, h: 1075 }, // full-screen layout
};

// Background color applied when ?bg=dark is set — used for testing against a
// solid background to verify layout and error states without a display background.
const DARK_BG_COLOR = '#111111';

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

    const url = new URL(request.url);

    // Resolve layout, falling back to the default if an invalid or missing value is passed
    const layoutKey = url.searchParams.get("layout") || "split";
    const layout    = LAYOUTS[layoutKey] || LAYOUTS["split"];

    // Parse ?bg=dark — when present, apply a solid dark background to all rendered pages.
    // This is used for testing; it does not affect production display behavior.
    const darkBg = url.searchParams.get('bg') === 'dark';

    const imgParam = url.searchParams.get("img");

    // Require the img parameter — return a styled error page if missing
    if (!imgParam) {
      console.log(`[station-image-proxy] Request received with no img parameter`);
      return generateErrorPage(layout.w, layout.h, "MISSING IMAGE KEY", "Check URL configuration", 400, darkBg);
    }

    // Parse and normalise the img parameter — replace spaces with +,
    // split on +, trim whitespace, and discard any empty segments
    const keys      = imgParam.replace(/\s+/g, "+").split("+").map(k => k.trim()).filter(Boolean);
    const isStacked = keys.length > 1;

    // --------------------------------------------------------
    // STACKED IMAGE PATH — two images displayed vertically
    // --------------------------------------------------------
    if (isStacked) {
      if (keys.length > 2) {
        console.log(`[station-image-proxy] Stacking error: too many keys (${keys.length}) requested`);
        return generateErrorPage(layout.w, layout.h, "INVALID IMAGE KEY", "Check URL configuration", 400, darkBg);
      }

      const src1       = MAPPING[keys[0]];
      const src2       = MAPPING[keys[1]];
      const slotHeight = Math.floor((layout.h - STACK_GAP) / 2);

      // Log any unrecognised keys so they are visible in Worker logs
      if (!src1) console.log(`[station-image-proxy] Unknown image key: "${keys[0]}"`);
      if (!src2) console.log(`[station-image-proxy] Unknown image key: "${keys[1]}"`);

      const body =
        `<div class="stack">` +
        renderSlot(src1, layout.w, slotHeight) +
        renderSlot(src2, layout.w, slotHeight) +
        `</div>`;

      return buildResponse(body, layout, darkBg);
    }

    // --------------------------------------------------------
    // SINGLE IMAGE PATH
    // --------------------------------------------------------
    const src = MAPPING[keys[0]];
    if (!src) {
      console.log(`[station-image-proxy] Unknown image key requested: "${keys[0]}"`);
      return generateErrorPage(layout.w, layout.h, "INVALID IMAGE KEY", "Check URL configuration", 400, darkBg);
    }

    const body = renderSlot(src, layout.w, layout.h);

    return buildResponse(body, layout, darkBg);
  },
};


// ============================================================
// RENDER SLOT
// Returns an HTML div for one image slot.
// If src is falsy (key not found in MAPPING), renders a styled
// error card in place of the image.
// The img onerror handler hides the failed image element and
// reveals the error card if the source URL fails to load.
// Defined at module level so it is not re-created on every request.
// ============================================================
function renderSlot(src, width, height) {
  const titleFont = Math.floor(Math.min(width, height) * 0.044);
  const subFont   = Math.floor(Math.min(width, height) * 0.030);

  // Shared slot error card CSS — dark fill so text is legible over the hardware
  // background in the area where the image would normally appear.
  const cardCss =
    `width:100%;height:100%;` +
    `background:rgba(0,0,0,0.50);` +
    `display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.floor(subFont * 0.5)}px;`;
  const titleCss = `font-family:"Segoe UI",Arial,Helvetica,sans-serif;font-weight:700;font-size:${titleFont}px;color:#C8102E;letter-spacing:0.06em;`;
  const subCss   = `font-family:"Segoe UI",Arial,Helvetica,sans-serif;font-size:${subFont}px;color:rgba(255,255,255,0.92);`;

  if (!src) {
    // Key was not found in MAPPING — show a configuration error card in this slot.
    return (
      `<div class="slot" style="width:${width}px;height:${height}px;">` +
      `<div style="${cardCss}">` +
      `<span style="${titleCss}">INVALID IMAGE KEY</span>` +
      `<span style="${subCss}">Check URL configuration</span>` +
      `</div>` +
      `</div>`
    );
  }

  // SECURITY NOTE: src comes exclusively from the MAPPING constant above and
  // is never derived from user-supplied input, so URL injection is not possible.

  return (
    `<div class="slot" style="width:${width}px;height:${height}px;">` +
    // On load failure, hide the broken img element and show the error card beneath it.
    `<img src="${src}" alt="" referrerpolicy="no-referrer" ` +
    `onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` +
    `<div style="${cardCss}display:none;">` +
    `<span style="${titleCss}">IMAGE UNAVAILABLE</span>` +
    `<span style="${subCss}">Image will return shortly</span>` +
    `</div>` +
    `</div>`
  );
}


// ============================================================
// BUILD RESPONSE
// Wraps the provided body content in a complete HTML document
// and returns it as a Response with appropriate headers.
//
// Image refresh is handled entirely by the display hardware —
// the browser re-requests source images directly from their
// origin servers on its own rendering cycle. No meta refresh
// tag is included.
//
// Cache-Control: no-store prevents the browser from serving a
// cached copy of the page, ensuring source images are always
// re-requested from their origin servers.
//
// Backgrounds are set to transparent throughout so the display
// hardware's built-in background shows through any areas not
// covered by the image (consistent with object-fit: contain).
//
// X-Frame-Options is intentionally omitted — this Worker is
// loaded as a full-screen iframe by the display system and that
// header would cause an immediate white error screen.
// ============================================================
function buildResponse(body, layout, darkBg = false) {
  const html =
    `<!DOCTYPE html>` +
    `<html>` +
    `<head>` +
    `<meta charset="UTF-8">` +
    `<style>` +
    // Reset margins and make all backgrounds transparent so the display
    // hardware's built-in background shows through uncovered areas
    `*,html,body{margin:0;padding:0;background:${darkBg ? DARK_BG_COLOR : 'transparent'};overflow:hidden;}` +
    // Stack layout: flex column with the configured gap between the two slots
    `.stack{display:flex;flex-direction:column;gap:${STACK_GAP}px;` +
    `width:${layout.w}px;height:${layout.h}px;}` +
    // Each slot uses explicit inline dimensions; img scales to fill via object-fit
    `.slot{position:relative;}` +
    `.slot img{width:100%;height:100%;object-fit:contain;display:block;}` +
    `</style>` +
    `</head>` +
    `<body>${body}</body>` +
    `</html>`;

  return new Response(html, {
    headers: {
      "Content-Type":           "text/html;charset=UTF-8",
      "Cache-Control":          "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}


// ============================================================
// GENERATE ERROR PAGE
// Returns a full-page styled HTML error response for
// unrecoverable configuration errors such as a missing or
// unknown image key, or too many stacked images requested.
//
// Accepts custom title and subtitle text so each error scenario
// displays a specific, actionable message on screen.
//
// No meta refresh is included — these are configuration errors
// that a page reload cannot resolve. They require a correction
// to the display system's configured URL.
// ============================================================
function generateErrorPage(width, height, title, subtitle, status, darkBg = false) {
  const titleFont = Math.floor(Math.min(width, height) * 0.030);
  const subFont   = Math.floor(Math.min(width, height) * 0.020);

  const html =
    `<!DOCTYPE html>` +
    `<html lang="en">` +
    `<head>` +
    `<meta charset="UTF-8">` +
    `<style>` +
    `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }` +
    `html, body {` +
    `  width: ${width}px; height: ${height}px;` +
    `  overflow: hidden; background: ${darkBg ? DARK_BG_COLOR : 'transparent'};` +
    `  font-family: "Segoe UI", Arial, Helvetica, sans-serif;` +
    `  display: flex; align-items: center; justify-content: center;` +
    `}` +
    `.err-wrap { display: flex; flex-direction: column; align-items: center; gap: ${Math.floor(subFont * 0.6)}px; text-align: center; padding: 0 ${Math.floor(width * 0.06)}px; }` +
    `.err-title { font-size: ${titleFont}px; font-weight: 700; color: #C8102E; letter-spacing: 0.06em; }` +
    `.err-sub   { font-size: ${subFont}px;   color: rgba(255,255,255,0.92); }` +
    `</style>` +
    `</head>` +
    `<body>` +
    `<div class="err-wrap">` +
    `<div class="err-title">${title}</div>` +
    `<div class="err-sub">${subtitle}</div>` +
    `</div>` +
    `</body>` +
    `</html>`;

  return new Response(html, {
    status,
    headers: {
      "Content-Type":           "text/html;charset=UTF-8",
      "Cache-Control":          "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
