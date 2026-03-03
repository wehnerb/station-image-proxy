/**

- STATION IMAGE PROXY
  */

// — GLOBAL CONTROL PANEL —
const CACHE_VERSION = 2;
const STACK_GAP = 10; // Pixels between stacked images

const LAYOUTS = {
“1”: { w: 1735, h: 720 }, // Wide (1-column)
“2”: { w: 852,  h: 720 }, // Split (2-column)
“3”: { w: 558,  h: 720 }  // Tri (3-column)
};

const REFRESH_TIMES = {
‘slow’: 3600,     // 60 Minutes
‘moderate’: 1200, // 20 Minutes
‘fast’: 300       // 5 Minutes
};

// — IMAGE MAPPING —
const MAPPING = {

// NOAA River Gauges

“riverlevel-redriver”: “https://water.noaa.gov/resources/hydrographs/fgon8_hg.png”,

// ND DOT Cameras

// I-94
“i94VeteransBlvd-south”: “https://www.dot.nd.gov/travel-info/cameras/I94@347.601Fargo9thStEWBSouth.jpg”,
“i94VeteransBlvd-east”: “https://www.dot.nd.gov/travel-info/cameras/I94RP347.565Fargo9thStEEBEast.jpg”,
“i9445thStS-south”: “https://www.dot.nd.gov/travel-info/cameras/I94RP348.602Fargo45thStSouth.jpg”,
“i9445thStS-east”: “https://www.dot.nd.gov/travel-info/cameras/I94RP348.602Fargo45thStEast.jpg”,
“i9445thStS-west”: “https://www.dot.nd.gov/travel-info/cameras/I94RP348.602Fargo45thStWest.jpg”,
“i9442ndStS-east”: “https://www.dot.nd.gov/travel-info/cameras/I94RP349.145Fargo42ndStSWBEast.jpg”,
“i9442ndStS-west”: “https://www.dot.nd.gov/travel-info/cameras/I94RP349.145Fargo42ndStSWBWest.jpg”,
“i29i94-north”: “https://www.dot.nd.gov/travel-info/cameras/fargotrilevelnorth.jpg”,
“i29i94-south”: “https://www.dot.nd.gov/travel-info/cameras/fargotrilevelsouth.jpg”,
“i94i29-east”: “https://www.dot.nd.gov/travel-info/cameras/fargotrileveleast.jpg”,
“i94i29-west”: “https://www.dot.nd.gov/travel-info/cameras/fargotrilevelwest.jpg”,
“i9425thStS-east”: “https://www.dot.nd.gov/travel-info/cameras/I94RP350.611Fargo25thStEast.jpg”,
“i9425thStS-west”: “https://www.dot.nd.gov/travel-info/cameras/I94RP350.603Fargo25thStWest.jpg”,
“i94UniversityDrS-east”: “https://www.dot.nd.gov/travel-info/cameras/I94RP351.617FargoUniversityDrEast.jpg”,
“i94UniversityDrS-west”: “https://www.dot.nd.gov/travel-info/cameras/I94RP351.617FargoUniversityDrWest.jpg”,
“i94RedRiver-east”: “https://www.dot.nd.gov/travel-info/cameras/I94RP352FargoRedRiverEast.jpg”,
“i94RedRiver-west”: “https://www.dot.nd.gov/travel-info/cameras/I94RP352FargoRedRiverWest.jpg”,

// I-29
“i2970thAveS-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP58.765FargoSouthof64thAveSNorth.jpg”,
“i2970thAveS-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP58.765FargoSouthof64thAveSSouth.jpg”,
“i2952ndAveS-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBNorth.jpg”,
“i2952ndAveS-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBSouth.jpg”,
“i2952ndAveS-east”: “https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBEast.jpg”,
“i2952ndAveS-west”: “https://www.dot.nd.gov/travel-info/cameras/I29RP60.293Fargo52ndAveSSBWest.jpg”,
“i2940thAveS-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP61.408Fargo40thAveNorth.jpg”,
“i2940thAveS-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP61.408Fargo40thAveSouth.jpg”,
“i2932ndAveS-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP62.627Fargo32ndAveSEastRampNorth.jpg”,
“i2932ndAveS-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP62.627Fargo32ndAveSEastRampSouth.jpg”,
“i2932ndAveS-west”: “https://www.dot.nd.gov/travel-info/cameras/I29RP62.627Fargo32ndAveSEastRampWest.jpg”,
“i2913thAveS-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP64.725FargoNorthof9thAveNorth.jpg”,
“i2913thAveS-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP64.135Fargo13thAveSSouth.jpg”,
“i29MainAve-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP65.272FargoMainAveSBNorth.jpg”,
“i29MainAve-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP65.272FargoMainAveSBSouth.jpg”,
“i297thAveN-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP65.741Fargo7thAveNSouth.jpg”,
“i2919thAveN-north”: “https://www.dot.nd.gov/travel-info/cameras/I29RP66.894Fargo19thAveNNorth.jpg”,
“i2919thAveN-south”: “https://www.dot.nd.gov/travel-info/cameras/I29RP66.894Fargo19thAveNSouth.jpg”
};

export default {
async fetch(request, env, ctx) {
const url = new URL(request.url);
const imgParam = url.searchParams.get(“img”);

```
if (!imgParam) return new Response("Error: Missing img parameter", { status: 400 });

// Determine Layout (Default to 2/Split if not specified)
const layoutKey = url.searchParams.get("layout") || "2";
const layout = LAYOUTS[layoutKey] || LAYOUTS["2"];

// Determine Refresh Rate (Default to fast if not specified)
const refreshKey = url.searchParams.get("refresh") || "fast";
const ttl = REFRESH_TIMES[refreshKey] || REFRESH_TIMES["fast"];
const bucket = Math.floor(Date.now() / 1000 / ttl);

// Process Keys (Check for Stacking via '+')
const keys = imgParam
  .replace(/\s+/g, '+')     // convert spaces back to +
  .split('+')
  .map(k => k.trim())
  .filter(Boolean);
const isStacked = keys.length > 1;

// --- STACKED LOGIC ---
if (isStacked) {

  // Block more than 2 stacked images
  if (keys.length > 2) {
    return generateFallback(layout.w, layout.h, "MAX 2 IMAGES FOR STACKING");
  }

  const src1 = MAPPING[keys[0]];
  const src2 = MAPPING[keys[1]];

  const imageWidth = layout.w;
  const imageHeight = (layout.h - STACK_GAP) / 2;
  const bottomY = imageHeight + STACK_GAP;

  // Renders either a real image slot or an inline error block for that slot
  function renderSlot(src, y) {
    if (src) {
      const weserv = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=${imageWidth}&h=${imageHeight}&fit=contain&bg=transparent&v=${CACHE_VERSION}&time=${bucket}`.replaceAll('&', '&amp;');
      return `<image href="${weserv}" x="0" y="${y}" width="${imageWidth}" height="${imageHeight}" />`;
    }
    const midY = y + imageHeight / 2;
    return `
      <rect x="0" y="${y}" width="${imageWidth}" height="${imageHeight}" fill="#1a1a1a"/>
      <text x="50%" y="${midY - 12}" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#e74c3c">CAMERA KEY NOT FOUND</text>
      <text x="50%" y="${midY + 20}" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#bdc3c7">Check your image key</text>`;
  }

  const compositeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${layout.h}">
    <rect width="100%" height="100%" fill="none"/>
    ${renderSlot(src1, 0)}
    ${renderSlot(src2, bottomY)}
  </svg>`.trim();

  return new Response(compositeSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${ttl}, must-revalidate`
    }
  });
}

// --- SINGLE IMAGE LOGIC ---
const src = MAPPING[keys[0]];
if (!src) return generateFallback(layout.w, layout.h, "CAMERA KEY NOT FOUND");

const weservURL = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=${layout.w}&h=${layout.h}&fit=contain&bg=transparent&v=${CACHE_VERSION}&time=${bucket}`;

try {
  const res = await fetch(weservURL, {
    headers: { "User-Agent": "FireStationDisplay/2.0" }
  });

  if (!res.ok) throw new Error("Source Down");

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/jpeg",
      "Cache-Control": `public, max-age=${ttl}, must-revalidate`,
      "X-System-Version": CACHE_VERSION.toString()
    }
  });

} catch (err) {
  return generateFallback(layout.w, layout.h);
}
```

}
};

function generateFallback(width, height, customMsg = “IMAGE UNAVAILABLE”) {
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"> <rect width="100%" height="100%" fill="none"/> <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="32" fill="#e74c3c"> ${customMsg} </text> <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#bdc3c7"> Image will return shortly </text> </svg>`;

return new Response(svg, {
status: 503,
headers: { “Content-Type”: “image/svg+xml”, “Cache-Control”: “no-store” }
});
}
