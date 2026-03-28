# 🚒 Station Image Proxy

A Cloudflare Worker that resizes, formats, and caches traffic camera and data images for fire station display screens.

-----

## Overview

Station display screens cannot resize images natively — without intervention, images either fail to fill a column or overflow beyond its boundaries. Additionally, multiple displays requesting the same images simultaneously from the upstream resizing service caused rate limiting, resulting in images failing to load.

This Worker solves both problems:

- **Resizes** images to exact pixel dimensions for each display column layout
- **Caches** resized images on a configurable schedule so all displays share cached responses rather than generating repeated upstream requests. For stacked images, both source images are fetched server-side and embedded directly into the response, so the complete composite is cached by Cloudflare as a single unit

The Worker sits between the display screen and the image source. The display is configured with a single Worker URL and requires no further maintenance unless the image sources or layout dimensions change.

**Production URL:** `https://station-image-proxy.bwehner.workers.dev/`  
**Staging URL:** `https://station-image-proxy-staging.bwehner.workers.dev/`

-----

## How It Works

```
Single image:  Display Screen → Cloudflare Worker → images.weserv.nl → Source Image
Stacked image: Display Screen → Cloudflare Worker → images.weserv.nl (×2, server-side) → Composite SVG
```

1. The display screen loads the Worker URL with parameters specifying the image key, layout, and refresh rate
1. The Worker looks up the source URL(s) from its internal mapping
1. **Single image:** The Worker fetches the image through images.weserv.nl, resized to the exact column dimensions, and returns it directly
1. **Stacked image:** The Worker builds an SVG composite containing two <image> elements that reference the weserv.nl resized URLs for each source image. The SVG is returned to the display browser, which then fetches the referenced images directly from weserv.nl when rendering.
1. Cloudflare caches the complete response for the configured refresh interval — for stacked images this includes all image data, so display browsers never make direct calls to images.weserv.nl
1. Subsequent requests within that window are served from cache — no upstream calls are made

-----

## URL Parameters

The Worker is called by appending parameters to the base URL. `img` is the only required parameter.

|Parameter|Default |Options                   |Description                                                      |
|---------|--------|--------------------------|-----------------------------------------------------------------|
|`img`    |required|Any key from `MAPPING`    |The image key to display. Combine two keys with `+` for stacking.|
|`layout` |`split` |`wide`, `split`, `tri`    |Column width: 1-column, 2-column, or 3-column                    |
|`refresh`|`fast`  |`fast`, `moderate`, `slow`|Cache refresh interval: 5 min, 20 min, or 1 hour                 |

-----

## Layout Dimensions

These pixel values match the exact column sizes of the display hardware. **Do not change these values unless the display hardware changes.**

|Layout |Width (px)|Height (px)|Use Case                        |
|-------|----------|-----------|--------------------------------|
|`wide` |1735      |720        |Full-width single column display|
|`split`|852       |720        |Two-column display (default)    |
|`tri`  |558       |720        |Three-column display            |
|`full` |1920      |1075       |Full-screen display             |

-----

## Refresh Rates

|Key       |Interval  |Use Case                             |
|----------|----------|-------------------------------------|
|`fast`    |5 minutes |Traffic cameras — frequently changing|
|`moderate`|20 minutes|Cameras that change less frequently  |
|`slow`    |1 hour    |River gauges and slowly updating data|

-----

## Image Stacking

Two images can be stacked vertically within a single column by separating two image keys with a `+` in the `img` parameter. The Worker automatically splits the column height equally between the two images with a configurable gap between them.

- Maximum of **2 images** per stack
- Attempting to stack 3 or more returns an error image
- The gap between images is controlled by the `STACK_GAP` constant in `worker_code.js` (currently 10px)
- The Worker returns a single SVG containing weserv.nl image references — the display browser contacts weserv.nl directly when rendering. The SVG wrapper itself is cached by Cloudflare, so the URL construction and key lookups are not repeated on every request.

-----

## Example URLs

**Single camera, two-column layout, 5-minute refresh:**

```
https://station-image-proxy.bwehner.workers.dev/?img=i29MainAve-north&layout=split&refresh=fast
```

**Two stacked cameras, two-column layout, 20-minute refresh:**

```
https://station-image-proxy.bwehner.workers.dev/?img=i29MainAve-north+i29MainAve-south&layout=split&refresh=moderate
```

**River gauge, full-width layout, 1-hour refresh:**

```
https://station-image-proxy.bwehner.workers.dev/?img=riverlevel-redriver&layout=wide&refresh=slow
```

-----

## Adding New Images

All images are defined in the `MAPPING` object near the top of `worker_code.js`. Each entry maps a short key name to a source image URL.

**To add a new image:**

1. Switch to the `staging` branch in GitHub
1. Edit `worker_code.js` and locate the `MAPPING` object
1. Add a new entry following this format:
   
   ```js
   "your-key-name": "https://full-url-to-the-source-image.jpg",
   ```
1. Follow the existing naming convention — lowercase, hyphens only, descriptive:
- ✅ `i29MainAve-north`
- ✅ `riverlevel-redriver`
- ❌ `Camera_1` or `new image`
1. Commit to `staging` and test using the staging URL before merging to `main`

> **Note:** The source image URL must be a direct, publicly accessible image URL. URLs that redirect to an HTML page, require authentication, or serve dynamic content may not work correctly with the resizing pipeline.

-----

## Configuration

The following constants at the top of `worker_code.js` control global behavior:

|Constant       |Default |Description                                                        |
|---------------|--------|-------------------------------------------------------------------|
|`CACHE_VERSION`|`2`     |Increment this to immediately invalidate all cached images         |
|`STACK_GAP`    |`10`    |Pixel gap between stacked images                                   |
|`LAYOUTS`      |See code|Pixel dimensions per layout — do not change unless hardware changes|
|`REFRESH_TIMES`|See code|Cache TTL in seconds per refresh key                               |

-----

## Deployment

This Worker uses GitHub Actions to deploy automatically to Cloudflare on every push.

|Branch   |Deploys To                                       |
|---------|-------------------------------------------------|
|`staging`|`station-image-proxy-staging.bwehner.workers.dev`|
|`main`   |`station-image-proxy.bwehner.workers.dev`        |

**All changes must go through staging before merging to main.**

### Required GitHub Secrets

Set these under **Settings → Secrets and variables → Actions** in this repository:

|Secret                 |Description                                                    |
|-----------------------|---------------------------------------------------------------|
|`CLOUDFLARE_API_TOKEN` |Cloudflare API token with Workers edit permissions             |
|`CLOUDFLARE_ACCOUNT_ID`|Cloudflare account ID (found on any zone page in the dashboard)|


> **Important:** After the first deployment of a new Worker environment, verify that secrets are also present in the Cloudflare dashboard under **Workers & Pages → [Worker Name] → Settings → Variables and Secrets**. If missing, they can be added manually without redeploying.

### Making a Change

1. Edit the relevant file(s) on the `staging` branch using the GitHub browser editor
1. Commit directly to `staging` — GitHub Actions will deploy to the staging Worker within ~30 seconds
1. Test the staging URL thoroughly
1. Merge `staging` into `main` — GitHub Actions will deploy to production automatically
1. Verify the production URL is working correctly

-----

## Troubleshooting

|Symptom                                          |Likely Cause                    |Resolution                                                                                   |
|-------------------------------------------------|--------------------------------|---------------------------------------------------------------------------------------------|
|Image shows `CAMERA KEY NOT FOUND`               |Invalid image key in the URL    |Check the `img` parameter against the `MAPPING` list in `worker_code.js`                     |
|Image shows `IMAGE UNAVAILABLE`                  |Source camera or feed is offline|Check the source URL directly — typically a third-party outage outside department control    |
|All images fail simultaneously                   |Rate limit or upstream outage   |Check images.weserv.nl status; consider incrementing `CACHE_VERSION` to force a cache refresh|
|GitHub Actions deployment fails                  |Invalid or expired API token    |Check the Actions log for details; re-create the failing secret and re-run the workflow      |
|Images look correct on staging but not production|Cached old version in production|Increment `CACHE_VERSION` in `worker_code.js` and redeploy                                   |

-----

## Network Requirements

Display screens must have outbound HTTPS access (port 443) to:

- `*.workers.dev` — Cloudflare Worker endpoints
- `images.weserv.nl` — Image resizing service (accessed by display browsers directly for both single and stacked images; the Worker constructs the weserv URLs but does not proxy the image data itself)
- `*.dot.nd.gov` — North Dakota DOT traffic cameras (accessed by the Worker server-side)
- `water.noaa.gov` — NOAA river gauge images (accessed by the Worker server-side)
- `usgs-nims-images.s3.amazonaws.com` — USGS river camera images (accessed by the Worker server-side)

-----

## Related

- [slide-timing-proxy](https://github.com/wehnerb/slide-timing-proxy) — Dynamic Google Slides timing Worker
- Full system documentation is maintained separately as `fire_station_display_documentation.docx`