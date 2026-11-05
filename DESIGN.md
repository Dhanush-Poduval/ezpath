---
name: Ezpath
description: Considered wayfinding for accessible journeys
colors:
  primary: "#264C3F"
  background: "#F7F8F4"
  ink: "#1D332B"
  olive: "#64775B"
  border: "#DCE1D7"
  surface: "#FFFFFF"
typography:
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "76px"
    fontWeight: 400
    lineHeight: 1.08
rounded:
  button: "4px"
  preview: "8px"
  map: "12px"
spacing:
  mobile-gutter: "20px"
  desktop-gutter: "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "18px 24px"
---
# Ezpath design system

## Overview
Ezpath feels like considered architectural wayfinding: calm, precise, and welcoming. Its audience is travellers planning around mobility requirements. The homepage introduces the experience; the application prioritizes route planning and operational clarity. The signature is a custom geographic route comparison, not decorative stock imagery.

## Colors
Runtime ownership: `tailwind.config.js` owns application colors; `src/styles/index.css` owns landing composition and browser surfaces.
- Porcelain background: #F7F8F4.
- Forest ink: #1D332B.
- Primary forest: #264C3F; hover #183B2E.
- Muted olive display accent: #64775B.
- Divider: #DCE1D7.
- White surface: #FFFFFF.
Semantic accessibility, warning, and disruption colors retain their existing roles. Never use color as the only indicator of route feasibility.

## Typography
DM Sans is the application and body typeface, with sans-serif fallbacks. DM Serif Display italic appears only in the landing headline, with Georgia fallback. Landing headline scales from 46px to 76px. Section headings use 34–50px. Body copy uses 13–15px and generous line-height. Utility labels are intentionally subordinate and never contain the only actionable information.

## Layout
The shared landing/header/footer container is capped at 1320px, with 56px desktop, 32px tablet, and 20px mobile side margins. Hero and explanation sections use two columns, becoming one below 800px. The operator overview, infrastructure, analytics, saved journeys and itinerary share the light product-page system. Operator metrics use a single pale olive strip with dividers; scenarios are native buttons. Journey summaries place status badges on a separate wrapping row, while each badge keeps its text on one line. The route preview has reserved geometry to avoid jumping between comparison states.

## Elevation & Depth
Flat surfaces and subtle dividers dominate. The route preview has one soft downward shadow. No decorative gradients, glowing panels, or repetitive feature cards.

## Shapes
Landing links use 4px corners, application buttons and status badges 6px, route preview 8px, map and workspace panels 12px. Badges use sentence case, normal tracking and no text wrapping. The Ezpath mark repeats a traversable path motif.

## Components
Navbar owns desktop and mobile navigation. Footer provides planner and network links. Existing shared Button, Card, Badge and form controls remain canonical for application screens. Tailwind theme changes propagate through them.
GSAP owns the hero entrance, SVG route draw, and shared ScrollTrigger reveals. useScrollReveal registers explicitly marked content including asynchronously rendered cards and cleans up triggers on route changes. The homepage explanation has a scroll-drawn progress line. Framer Motion owns comparison, mobile-navigation transitions and the document scroll progress indicator. Both respect reduced motion. Animation is scoped and cleaned up on unmount. Global CSS owns focus, selection, caret and scrollbars, including forced-colors behavior.

## Do's and Don'ts
Use plain traveller-facing language. Label demo data. Preserve offline storage keys during visual renames. Keep primary route actions prominent. Never claim verified accessibility certification from visual inspection. Avoid dashboard jargon on the landing page and never hide essential navigation on mobile.
