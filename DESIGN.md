---
version: alpha
name: "Beauty Professionals Magazine"
description: "A black, white, and champagne editorial system for independent beauty-industry journalism and its administration."
colors:
  ink: "#101010"
  night: "#090909"
  charcoal: "#343434"
  paper: "#F6F4EF"
  white: "#FFFFFF"
  champagne: "#B89B62"
  muted: "#626262"
typography:
  display:
    fontFamily: "Arsenica Trial, Georgia, Times New Roman, serif"
  utility:
    fontFamily: "Raleway, Arial, sans-serif"
  prose:
    fontFamily: "Garamond, Georgia, serif"
  product:
    fontFamily: "Involve, Arial, sans-serif"
rounded:
  DEFAULT: "0px"
spacing:
  page-gutter: "clamp(1rem, 3.2vw, 3rem)"
  section: "clamp(3.5rem, 7vw, 7.5rem)"
components:
  masthead: {}
  editorial-story: {}
  button: {}
  field: {}
  dialog: {}
---

# Beauty Professionals Magazine Design System

## Overview

### Creative North Star

The public site should feel like a newly opened print beauty magazine: decisive cover typography, full-bleed photography, fine editorial rules, and metallic ink used with restraint. The admin area is the same publication's production desk—plain, legible, and familiar rather than theatrical.

### Product context and register

- **Audience and primary job:** Beauty professionals and readers discover reporting; editors publish articles, manage distribution, and maintain the active Lookbook.
- **Target market(s) and evidence:** English-language United States readership, reflected by the US distribution product and current English content.
- **Locale(s) and language policy:** English is the current product language.
- **Usage scene:** Public reading spans mobile and desktop. Admin work is primarily desktop but remains operable on narrow screens.
- **Register:** Hybrid. Public routes lead with brand/editorial expression; `/admin` routes use a restrained product register.
- **Memorable signature:** The homepage “cover-line spread”: one dominant feature and a ruled recent-story rail sharing a continuous editorial axis.
- **Restraint:** Flat geometry, honest controls, sparse champagne accents, and no decorative card chrome.
- **Anti-references:** Dashboard tile grids, generic colorful gradients, excessive rounded containers, bouncing motion, and faux-newspaper density.
- **Token ownership/runtime mapping:** Existing runtime CSS in `app/globals.css` remains canonical (Model B). This document mirrors its accepted tokens; shared components consume the CSS variables and Tailwind utilities. Drift is checked by design lint, project lint, browser inspection, and the premium static audit.

## Colors

`ink` is primary copy and rule color; `night` and `charcoal` build the restrained masthead gradient. `white` is the principal reading surface and `paper` is the quiet secondary surface. `champagne` is an expressive metallic cue for small labels and focus details, never a low-contrast body-text color. `muted` supports secondary metadata. Forced-colors mode remains system-owned.

## Typography

The display stack carries article headlines and mastheads with tight leading and editorial contrast. Raleway is the utility face for navigation, labels, controls, and compact metadata. Garamond supports long-form article prose, while Involve is the product/body fallback where clarity matters. Display typography is used with restraint; interface actions remain direct and readable. Uppercase is reserved for short navigational and editorial labels.

## Layout

Public content uses a fluid page gutter and a maximum reading frame of 90rem. The homepage lead becomes an approximately 70/30 spread at desktop sizes, a dominant feature plus compact rail at tablet sizes, and one clear reading sequence on mobile. Images always reserve an aspect ratio. Horizontal sponsor overflow stays visible and operable on narrow screens. Admin routes preserve the existing sidebar/content grid and natural document scrolling.

## Elevation & Depth

Hierarchy comes from contrast, scale, dividers, and tonal surfaces. Static editorial content is flat. Shadows are reserved for overlays and floating navigation panels where separation from the document is necessary.

## Shapes

The publication uses square corners and hairline rules. Buttons, fields, story frames, and dialogs use the same zero-radius language. Focus rings sit outside the component so they remain visible against both light and dark surfaces.

## Components

### Foundational visual states

Enabled controls have explicit hover, focus-visible, and active treatments. Disabled and busy states retain geometry and remove misleading interaction. Errors are written inline and announced. Loading surfaces reserve the final content footprint; skeletons are used only where the existing site already owns them.

### Buttons and actions

Solid ink buttons are primary, outlines are secondary, and text buttons are tertiary. Destructive actions use the shared red intent and appear separately from safe actions. Busy labels preserve button dimensions.

### Navigation and data display

The masthead uses the night-to-charcoal gradient and thin translucent rules. Category navigation stays in the header. Active links use an underline or rule, not a pill. Editorial story lists become a natural vertical reading order on mobile.

### Forms and overlays

Fields are square, white, and explicitly labeled. Uploads expose file type and size before selection, validate on both client and server, show a preview, and preserve retry/removal paths. Destructive removal uses the shared app-owned confirmation dialog. Dialogs trap focus through native modal semantics, close with Escape, restore focus, and keep actions reachable on narrow screens.

### Iconography

Lucide is the canonical icon family, normally 1.5–1.6px stroke. Icons support text labels unless the control has a universally understood symbol and a clear accessible name.

### Motion

GSAP owns editorial entrances: opacity, small vertical movement, and clipped image reveals with `power3.out`/`power2.out` easing. Entry motion lasts roughly 0.55–0.9 seconds; hover feedback is shorter. Scroll entrances run once and never pin or add ambient parallax. `prefers-reduced-motion` removes transforms and reveals content immediately.

### Content and data visualization

Copy is plain, publication-aware, and action-led. Article metadata uses concise date/author labels. Administrative success and failure messages name what changed and how to recover.

## Do's and Don'ts

- **Do:** Let one story dominate the homepage and keep its secondary rail compact.
- **Do:** Reuse the shared button, field, navigation, and upload infrastructure across admin workflows.
- **Don't:** turn editorial content into rounded cards or a dashboard grid.
- **Don't:** use champagne for small body copy, hide scrollbars, or make animation necessary to understand the page.
