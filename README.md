# Bomb Assets

Public CDN-hosted assets for TheBomb® websites. Served via
[jsDelivr](https://www.jsdelivr.com/) so updates go live without rebuilding
consumer sites.

## Assets

### `badge.js` — Footer Credit Badge

Responsive web component credit badge. Drop-in `<script>` + custom element.

**CDN URLs**

| Channel | URL | Cache |
|---|---|---|
| Auto-update (latest on `main`) | `https://cdn.jsdelivr.net/gh/thebombonline/assets@main/badge.js` | ~12h (purgeable) |
| Version-pinned | `https://cdn.jsdelivr.net/gh/thebombonline/assets@v1.0.0/badge.js` | Permanent |
| Minified auto-update | `https://cdn.jsdelivr.net/gh/thebombonline/assets@main/badge.min.js` | ~12h |

**Usage**

```html
<script src="https://cdn.jsdelivr.net/gh/thebombonline/assets@main/badge.js" defer></script>
<thebomb-badge></thebomb-badge>
```

**Attributes** — see the full header comment inside `badge.js` for the LLM
coding-agent guide (placement, customization, CSS vars, etc.). Key options:

- `location="Made in BC"` — tagline after the brand
- `theme="light|dark"` — surface theme
- `accent="#1d4ed8"` — reveal text color
- `block` — full-width centered layout
- `compact` — shortest label at every breakpoint
- `size="xs|sm|md|lg"` — override responsive auto-sizing

## Workflow

### Updating `badge.js`

```bash
# 1. Edit badge.js locally
# 2. Commit + push
git add badge.js
git commit -m "badge: describe the change"
git push

# 3. (Optional) Force-purge the jsDelivr CDN for instant propagation
curl https://purge.jsdelivr.net/gh/thebombonline/assets@main/badge.js
```

### Cutting a version-pinned release

```bash
git tag v1.0.1
git push origin v1.0.1
# Consumers can pin to @v1.0.1 for permanent caching
```

## License

Proprietary — © TheBomb. All rights reserved.
