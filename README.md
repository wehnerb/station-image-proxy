# Station Image Proxy

A Cloudflare Worker that resizes, formats, and caches traffic camera and river gauge images for fire station display screens.

## 📄 System Documentation
Full documentation (architecture, setup, account transfer, IT reference): https://github.com/wehnerb/ffd-display-system-documentation

---

## Live URLs

| Environment | URL |
|---|---|
| Production | `https://station-image-proxy.bwehner.workers.dev/` |
| Staging | `https://station-image-proxy-staging.bwehner.workers.dev/` |

---

## URL Parameters

| Parameter | Default | Options | Description |
|---|---|---|---|
| `?img=` | required | Any key from `MAPPING` | Image key to display. Combine two keys with `+` to stack vertically. |
| `?layout=` | `split` | `wide`, `split`, `tri`, `full` | Column width |
| `?refresh=` | `fast` | `fast`, `moderate`, `slow` | Cache refresh interval |

| Layout | Width | Height |
|---|---|---|
| `full` | 1920px | 1075px |
| `wide` | 1735px | 720px |
| `split` | 852px | 720px |
| `tri` | 558px | 720px |

| Refresh | Interval | Use Case |
|---|---|---|
| `fast` | 5 min | Traffic cameras |
| `moderate` | 20 min | Less frequently changing cameras |
| `slow` | 1 hour | River gauges |

---

## Adding a New Image

1. Edit `worker_code.js` on the `staging` branch and locate the `MAPPING` object
2. Add a new entry:
```js
   "your-key-name": "https://full-url-to-source-image.jpg",
```
3. Use lowercase, hyphens only (e.g. `i29MainAve-north`, `riverlevel-redriver`)
4. Test at the staging URL, then merge to `main`

Source URLs must be direct, publicly accessible image URLs — not HTML pages or authenticated endpoints.

---

## Configuration (`worker_code.js`)

| Constant | Default | Description |
|---|---|---|
| `CACHE_VERSION` | *(current)* | Increment to immediately invalidate all cached images |
| `STACK_GAP` | `10` | Pixel gap between stacked images |
| `LAYOUTS` | See code | Pixel dimensions per layout — do not change unless hardware changes |
| `REFRESH_TIMES` | See code | Cache TTL in seconds per refresh key |

---

## Secrets

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token — Workers edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

---

## Deployment

| Branch | Deploys To | Purpose |
|---|---|---|
| `staging` | `station-image-proxy-staging.bwehner.workers.dev` | Testing |
| `main` | `station-image-proxy.bwehner.workers.dev` | Production |

Push to either branch — GitHub Actions deploys automatically (~30–45 sec).  
**Always stage and test before merging to main.**  
To roll back: use the Cloudflare dashboard **Deployments** tab, then revert the commit on `main`.
