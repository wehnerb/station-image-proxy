/**
 * STATION IMAGE PROXY
 */

// GLOBAL CONTROL PANEL
const CACHE_VERSION = 2;
const STACK_GAP = 10; // Change this value to change the spacing between stacked images

const LAYOUTS = {
  "wide":  { w: 1735, h: 720 }, // Exact size for 1-column layout — do not change
  "split": { w: 852,  h: 720 }, // Exact size for 2-column layout — do not change
  "tri":   { w: 558,  h: 720 }  // Exact size for 3-column layout — do not change
};

const REFRESH_TIMES = {
  "slow":     3600, // 1 hour
  "moderate": 1200, // 20 minutes
  "fast":     300   // 5 minutes
};

// IMAGE MAPPING
const MAPPING = {

  // NOAA River Gauges
  "riverlevel-redriver": "https://water.noaa.gov/resources/hydrographs/fgon8_hg.png",

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
  "i2919thAveN-south":  "https://www.dot.nd.gov/travel-info/cameras/I29RP66.894Fargo19thAveNSouth.jpg"
};

// HELPERS

/**
 * Builds a weserv.nl proxy URL for a given source image and dimensions.
 */
function buildWeservURL(src, width, height, cacheVersion, bucket) {
  return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=${width}&h=${height}&fit=contain&bg=transparent&v=${cacheVersion}&time=${bucket}`;
}

/**
 * Renders a single image slot in a stacked SVG composite.
 * If src is missing, renders a CAMERA KEY NOT FOUND error block instead.
 */
function renderSlot(src, y, imageWidth, imageHeight, cacheVersion, bucket) {
  if (src) {
    const weserv = buildWeservURL(src, imageWidth, imageHeight, cacheVersion, bucket);
    return `<image href="${weserv}" x="0" y="${y}" width="${imageWidth}" height="${imageHeight}" />`;
  }

  const midY = y + imageHeight / 2;
  return [
    `<rect x="0" y="${y}" width="${imageWidth}" height="${imageHeight}" fill="#1a1a1a"/>`,
    `<text x="50%" y="${midY - 12}" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#e74c3c">CAMERA KEY NOT FOUND</text>`,
    `<text x="50%" y="${midY + 20}" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#bdc3c7">Check your image key</text>`
  ].join("");
}

/**
 * Returns a fallback SVG response when an image is unavailable or a key is invalid.
 */
function generateFallback(width, height, customMsg = "IMAGE UNAVAILABLE") {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
    `<rect width="100%" height="100%" fill="none"/>`,
    `<text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="32" fill="#e74c3c">${customMsg}</text>`,
    `<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#bdc3c7">Image will return shortly</text>`,
    `</svg>`
  ].join("");

  return new Response(svg, {
    status: 503,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store"
    }
  });
}

// MAIN HANDLER

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const imgParam = url.searchParams.get("img");

    if (!imgParam) {
      return new Response("Error: Missing img parameter", { status: 400 });
    }

    const layoutKey = url.searchParams.get("layout") ?? "split";
    const layout = LAYOUTS[layoutKey] ?? LAYOUTS["split"];

    const refreshKey = url.searchParams.get("refresh") ?? "fast";
    const ttl = REFRESH_TIMES[refreshKey] ?? REFRESH_TIMES["fast"];
    const bucket = Math.floor(Date.now() / 1000 / ttl);

    const keys = imgParam
      .replace(/\s+/g, "+")
      .split("+")
      .map(k => k.trim())
      .filter(Boolean);

    // Guard: no valid keys remain after parsing
    if (keys.length === 0) {
      return generateFallback(layout.w, layout.h, "INVALID IMG PARAMETER");
    }

    const isStacked = keys.length > 1;

    // Stacked: 2-image composite SVG
    if (isStacked) {
      if (keys.length > 2) {
        return generateFallback(layout.w, layout.h, "MAX 2 IMAGES FOR STACKING");
      }

      const src1 = MAPPING[keys[0]];
      const src2 = MAPPING[keys[1]];
      const imageWidth = layout.w;
      const imageHeight = (layout.h - STACK_GAP) / 2;
      const bottomY = imageHeight + STACK_GAP;

      const compositeSvg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${layout.h}">`,
        `<rect width="100%" height="100%" fill="none"/>`,
        renderSlot(src1, 0, imageWidth, imageHeight, CACHE_VERSION, bucket),
        renderSlot(src2, bottomY, imageWidth, imageHeight, CACHE_VERSION, bucket),
        `</svg>`
      ].join("");

      return new Response(compositeSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": `public, max-age=${ttl}, must-revalidate`
        }
      });
    }

    // Single image proxy
    const src = MAPPING[keys[0]];
    if (!src) {
      return generateFallback(layout.w, layout.h, "CAMERA KEY NOT FOUND");
    }

    const weservURL = buildWeservURL(src, layout.w, layout.h, CACHE_VERSION, bucket);

    try {
      const res = await fetch(weservURL, {
        headers: { "User-Agent": "FireStationDisplay/2.0" }
      });

      if (!res.ok) throw new Error("Source Down");

      return new Response(res.body, {
        headers: {
          "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
          "Cache-Control": `public, max-age=${ttl}, must-revalidate`,
          "X-System-Version": CACHE_VERSION.toString()
        }
      });
    } catch (err) {
      return generateFallback(layout.w, layout.h);
    }
  }
};
