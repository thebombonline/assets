/**
 * ============================================================================
 *  TheBomb® Footer Badge — Responsive Web Component
 * ============================================================================
 *
 *  A self-contained, framework-agnostic credit badge for websites built by
 *  TheBomb. Drops anywhere, renders via Shadow DOM (no style bleed), and
 *  scales cleanly from 320px mobile up to 4K desktops.
 *
 *  ── QUICK START ───────────────────────────────────────────────────────────
 *    <script src="https://thebomb.ca/badge.js" defer></script>
 *    <thebomb-badge></thebomb-badge>
 *
 *  ── SUPPORTED ATTRIBUTES ──────────────────────────────────────────────────
 *    location="Made in BC"       Tagline shown after the brand. Default: "Made in BC".
 *    accent="#1d4ed8"            Color for the "Check us out" reveal text.
 *    theme="light|dark"          Surface theme. Default: "light".
 *    block                       Boolean. Renders full-width, centered (good for mobile footers).
 *    compact                     Boolean. Forces the shortest label at every breakpoint.
 *    size="xs|sm|md|lg"          Override responsive auto-sizing. Default: auto (responsive).
 *    href="https://thebomb.ca"   Override destination URL.
 *    utm="off"                   Disable automatic UTM parameters.
 *
 *  ── EXAMPLES ──────────────────────────────────────────────────────────────
 *    <thebomb-badge></thebomb-badge>
 *    <thebomb-badge theme="dark" location="Built in Vernon"></thebomb-badge>
 *    <thebomb-badge block accent="#f59e0b"></thebomb-badge>
 *    <thebomb-badge compact></thebomb-badge>               ← use in tight footers
 *    <thebomb-badge size="lg"></thebomb-badge>             ← force a specific size
 *
 *  ── RESPONSIVE BEHAVIOR (auto, unless `size` is set) ──────────────────────
 *    Mobile small  (≤374px)  → font 9px,  short label "Website Design by TheBomb®",
 *                              hides reveal text on hover (space-constrained).
 *    Mobile large  (375–639) → font 10px, short label "Website Design by TheBomb®".
 *    Tablet        (640–1023)→ font 10px, full label, reveal enabled.
 *    Desktop       (≥1024)   → font 11px, full label, reveal enabled, larger padding.
 *
 *  ── WHERE TO PLACE IT (guidance for LLM coding agents) ────────────────────
 *    • Typical spot: site footer, bottom-right or centered under copyright.
 *    • For Astro:    put <thebomb-badge></thebomb-badge> inside Footer.astro
 *                    and add the <script src="https://thebomb.ca/badge.js" defer>
 *                    tag in BaseHead.astro or the layout's <head>.
 *    • For React:    use as-is in JSX; React supports custom elements.
 *                    Load script once (e.g. in <Head> or index.html).
 *    • For WordPress: paste the <script> in theme header.php and the custom
 *                     element in footer.php.
 *    • Centered mobile footer? → add the `block` attribute.
 *    • Dark footer?            → add theme="dark".
 *    • Tight space / sidebar?  → add the `compact` attribute.
 *
 *  ── HOW TO CUSTOMIZE (guidance for LLM coding agents) ─────────────────────
 *    1. NEVER style this from outside — Shadow DOM isolates internal CSS.
 *       To recolor the accent use the `accent` attribute, or the CSS var
 *       --tb-accent on the host element:
 *           thebomb-badge { --tb-accent: #ff0066; }
 *       Other exposed vars: --tb-bg, --tb-bg-hover, --tb-border,
 *                           --tb-border-hover, --tb-fg.
 *    2. To change copy, edit the `_render()` method's `label.innerHTML`.
 *    3. To add a new breakpoint, add a new @media block inside the <style>
 *       tag. Keep mobile-first ordering (min-width ascending).
 *    4. To ship a new feature flag, add it to `observedAttributes` AND read
 *       it in `_render()`. Shadow DOM re-renders on attribute change.
 *    5. Keep the file a single IIFE that self-registers the custom element —
 *       this is what makes the drop-in <script> pattern work.
 *
 *  ── ACCESSIBILITY ─────────────────────────────────────────────────────────
 *    • Link has rel="noopener noreferrer" and target="_blank".
 *    • Decorative <span class="shine"> uses aria-hidden.
 *    • Respects `prefers-reduced-motion`.
 *    • Color contrast tested against both light and dark surfaces.
 *
 *  ── VERSION ───────────────────────────────────────────────────────────────
 *    v2.0.0  — Responsive across mobile small/large, tablet, desktop.
 *              Added `compact`, `size`, expanded LLM guidance comments.
 *    v2.1.0  — Short label now reads "Website Design by TheBomb®" on mobile
 *              (was "by TheBomb®"). Host shrinks to parent width on narrow
 *              viewports so the badge no longer clips off-screen.
 * ============================================================================
 */
(() => {
  // Guard against double-registration when the script is loaded more than once
  // (common on SPAs, preview tools, or when multiple pages include it).
  if (customElements.get('thebomb-badge')) return;

  const TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML = `
    <style>
      /* ─── Host / base ──────────────────────────────────────────────────
         Keep :host rules minimal — they affect the element's outer box.
         Inner layout lives on .badge so it can flex with modifiers. */
      :host {
        display: inline-block;
        max-width: 100%;
        box-sizing: border-box;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        /* CSS custom properties — override from outside for light tweaks. */
        --tb-border: #e2e8f0;
        --tb-border-hover: #cbd5e1;
        --tb-bg: #f8fafc;
        --tb-bg-hover: #f1f5f9;
        --tb-fg: #94a3b8;
        --tb-accent: #1d4ed8;

        /* Responsive tokens (mobile-small defaults; overridden below). */
        --tb-font-size: 9px;
        --tb-padding-y: 0.4rem;
        --tb-padding-x: 0.7rem;
        --tb-gap: 0.375rem;
        --tb-logo-size: 0.875rem;
        --tb-arrow-size: 0.625rem;
        --tb-reveal-max: 0px;          /* hidden on very small screens */
      }
      :host([block]) { display: block; }

      /* ─── Dark theme ───────────────────────────────────────────────── */
      :host([theme="dark"]) {
        --tb-border: #334155;
        --tb-border-hover: #475569;
        --tb-bg: #0f172a;
        --tb-bg-hover: #1e293b;
        --tb-fg: #94a3b8;
      }

      /* ─── Manual size overrides (attribute size="xs|sm|md|lg") ──────── */
      :host([size="xs"]) { --tb-font-size: 9px;  --tb-padding-y: 0.35rem; --tb-padding-x: 0.6rem;  --tb-logo-size: 0.75rem; --tb-arrow-size: 0.6rem; --tb-reveal-max: 0px; }
      :host([size="sm"]) { --tb-font-size: 10px; --tb-padding-y: 0.45rem; --tb-padding-x: 0.85rem; --tb-logo-size: 0.875rem; --tb-arrow-size: 0.7rem; --tb-reveal-max: 110px; }
      :host([size="md"]) { --tb-font-size: 11px; --tb-padding-y: 0.55rem; --tb-padding-x: 1rem;    --tb-logo-size: 1rem;    --tb-arrow-size: 0.75rem; --tb-reveal-max: 130px; }
      :host([size="lg"]) { --tb-font-size: 12px; --tb-padding-y: 0.65rem; --tb-padding-x: 1.15rem; --tb-logo-size: 1.1rem;  --tb-arrow-size: 0.85rem; --tb-reveal-max: 150px; }

      /* ─── Badge container ──────────────────────────────────────────── */
      .badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: var(--tb-gap);
        padding: var(--tb-padding-y) var(--tb-padding-x);
        border-radius: 9999px;
        border: 1px solid var(--tb-border);
        background: var(--tb-bg);
        color: var(--tb-fg);
        font-size: var(--tb-font-size);
        font-weight: 500;
        letter-spacing: 0.025em;
        line-height: 1.2;
        text-decoration: none;
        overflow: hidden;
        transition: background-color 200ms ease, border-color 200ms ease;
        cursor: pointer;
        max-width: 100%;
        box-sizing: border-box;
      }
      .badge:hover {
        background: var(--tb-bg-hover);
        border-color: var(--tb-border-hover);
      }
      .badge:focus-visible {
        outline: 2px solid var(--tb-accent);
        outline-offset: 2px;
      }

      /* Block mode → full-width, centered. Great for mobile footers. */
      :host([block]) .badge {
        display: flex;
        width: 100%;
        justify-content: center;
        padding: calc(var(--tb-padding-y) + 0.1rem) var(--tb-padding-x);
      }

      /* ─── Decorative shine sweep on hover ──────────────────────────── */
      .shine {
        position: absolute;
        top: 0;
        left: -75%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          120deg,
          transparent 0%,
          transparent 30%,
          rgba(255, 255, 255, 0.85) 50%,
          transparent 70%,
          transparent 100%
        );
        transform: skewX(-20deg);
        pointer-events: none;
        opacity: 0;
      }
      :host([theme="dark"]) .shine {
        background: linear-gradient(
          120deg,
          transparent 0%,
          transparent 30%,
          rgba(255, 255, 255, 0.15) 50%,
          transparent 70%,
          transparent 100%
        );
      }
      .badge:hover .shine {
        animation: shine-sweep 1.1s ease-out forwards;
      }
      @keyframes shine-sweep {
        0%   { left: -75%; opacity: 0; }
        20%  { opacity: 1; }
        80%  { opacity: 1; }
        100% { left: 125%; opacity: 0; }
      }

      /* ─── Inner pieces ─────────────────────────────────────────────── */
      .logo {
        position: relative;
        z-index: 1;
        width: var(--tb-logo-size);
        height: var(--tb-logo-size);
        flex-shrink: 0;
      }
      .label {
        position: relative;
        z-index: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      /* The short label is shown on the smallest screens;
         the full label is shown on larger screens. We toggle with display. */
      .label .full  { display: none; }
      .label .short { display: inline; }

      .reveal {
        position: relative;
        z-index: 1;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        max-width: 0;
        transition: max-width 500ms ease-out;
      }
      .badge:hover .reveal {
        max-width: var(--tb-reveal-max);
      }
      .reveal-text {
        display: inline-block;
        padding-left: 0.25rem;
        color: var(--tb-accent);
        font-weight: 600;
      }

      .arrow {
        position: relative;
        z-index: 1;
        width: var(--tb-arrow-size);
        height: var(--tb-arrow-size);
        flex-shrink: 0;
        transition: transform 300ms ease;
      }
      .badge:hover .arrow {
        transform: translateX(0.125rem);
      }

      /* ─── Responsive breakpoints (auto-sizing) ─────────────────────────
         Only apply when the user hasn't forced a size. We gate via :not()
         so explicit size="..." always wins.                              */

      /* Mobile large (≥375px) — show short label + tagline, enable reveal. */
      @media (min-width: 375px) {
        :host(:not([size])) {
          --tb-font-size: 10px;
          --tb-padding-y: 0.45rem;
          --tb-padding-x: 0.85rem;
          --tb-gap: 0.4rem;
          --tb-logo-size: 0.9rem;
          --tb-arrow-size: 0.7rem;
          --tb-reveal-max: 110px;
        }
      }

      /* Tablet (≥640px) — full label, more breathing room. */
      @media (min-width: 640px) {
        :host(:not([size])) {
          --tb-font-size: 10px;
          --tb-padding-y: 0.5rem;
          --tb-padding-x: 1rem;
          --tb-gap: 0.5rem;
          --tb-logo-size: 1rem;
          --tb-arrow-size: 0.75rem;
          --tb-reveal-max: 120px;
        }
        :host(:not([compact])) .label .full  { display: inline; }
        :host(:not([compact])) .label .short { display: none; }
      }

      /* Desktop (≥1024px) — slightly larger type and padding. */
      @media (min-width: 1024px) {
        :host(:not([size])) {
          --tb-font-size: 11px;
          --tb-padding-y: 0.55rem;
          --tb-padding-x: 1.1rem;
          --tb-gap: 0.55rem;
          --tb-logo-size: 1rem;
          --tb-arrow-size: 0.8rem;
          --tb-reveal-max: 140px;
        }
      }

      /* Large desktop (≥1536px) — comfortable for 2K/4K monitors. */
      @media (min-width: 1536px) {
        :host(:not([size])) {
          --tb-font-size: 12px;
          --tb-padding-y: 0.6rem;
          --tb-padding-x: 1.25rem;
          --tb-logo-size: 1.1rem;
          --tb-arrow-size: 0.85rem;
          --tb-reveal-max: 160px;
        }
      }

      /* Compact mode overrides — always use the short label. */
      :host([compact]) .label .full  { display: none; }
      :host([compact]) .label .short { display: inline; }

      /* Accessibility — respect reduced motion. */
      @media (prefers-reduced-motion: reduce) {
        .badge:hover .shine { animation: none; }
        .reveal, .arrow, .badge { transition: none; }
      }
    </style>

    <a class="badge" href="https://thebomb.ca" target="_blank" rel="noopener noreferrer" part="badge">
      <span class="shine" aria-hidden="true"></span>
      <img class="logo" src="https://thebomb.ca/favicon.svg" alt="" width="16" height="16" loading="lazy" decoding="async" />
      <span class="label">
        <!-- Two copies of the label; CSS shows one depending on breakpoint. -->
        <span class="short"></span>
        <span class="full"></span>
      </span>
      <span class="reveal"><span class="reveal-text">Check us out</span></span>
      <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clip-rule="evenodd" />
      </svg>
    </a>
  `;

  class TheBombBadge extends HTMLElement {
    /**
     * Attributes that trigger a re-render when changed.
     * If you add a new attribute in _render(), add it here too.
     */
    static get observedAttributes() {
      return ['location', 'accent', 'href', 'utm', 'theme', 'size', 'compact', 'block'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).appendChild(TEMPLATE.content.cloneNode(true));
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    _render() {
      const locationAttr = this.getAttribute('location') || 'Made in BC';
      const accent       = this.getAttribute('accent');
      const utm          = this.getAttribute('utm') !== 'off';
      const baseHref     = this.getAttribute('href') || 'https://thebomb.ca';

      const badge      = this.shadowRoot.querySelector('.badge');
      const shortLabel = this.shadowRoot.querySelector('.label .short');
      const fullLabel  = this.shadowRoot.querySelector('.label .full');

      // Two label variants — CSS switches them based on breakpoint + `compact`.
      //   short: used on small screens and when [compact] is present
      //   full:  used on tablet+ when [compact] is NOT present
      shortLabel.innerHTML = `Website Design by TheBomb&reg;`;
      fullLabel.innerHTML  = `Website Development by TheBomb&reg; &middot; ${locationAttr}`;

      // Attach UTM params so we can attribute referral traffic back to this
      // badge. Consumers can opt out with utm="off".
      if (utm) {
        const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || 'site';
        try {
          const url = new URL(baseHref);
          if (!url.searchParams.has('utm_source'))   url.searchParams.set('utm_source', host);
          if (!url.searchParams.has('utm_medium'))   url.searchParams.set('utm_medium', 'footer-badge');
          if (!url.searchParams.has('utm_campaign')) url.searchParams.set('utm_campaign', 'credit-badge');
          badge.setAttribute('href', url.toString());
        } catch (_err) {
          // Fallback if baseHref is not a valid URL for some reason.
          badge.setAttribute('href', baseHref);
        }
      } else {
        badge.setAttribute('href', baseHref);
      }

      if (accent) {
        this.style.setProperty('--tb-accent', accent);
      }
    }
  }

  customElements.define('thebomb-badge', TheBombBadge);
})();
