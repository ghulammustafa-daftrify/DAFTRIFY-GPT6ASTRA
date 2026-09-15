# DAFTRIFY / Continuous Cinematic Experience

The complete website lives in **`index.html`**, including markup, CSS, SVG artwork, interactions and motion controllers. No framework compilation is necessary to view it.

## What Changed

This version uses the supplied Orchid video as one persistent, full-viewport background throughout the whole website. It does not end when the hero ends. The original clip is not replaced with stock footage, filtered to grayscale, or duplicated in a separate video for each section.

Motion is scroll-linked, not a one-time reveal. Sections, document fragments and proof surfaces enter and leave in both directions. Scrolling upward reverses the dossier, its annotations, its field corrections and its status. Ambient paper movement repeats while visible; there are no permanent JavaScript interval loops.

## Run Locally

Open `index.html` directly, or use the existing development command:

```bash
npm run dev
```

Visit `http://localhost:5173`. The development command uses `npx serve`, so its first invocation requires network access.

An alternative with Python already installed:

```bash
python3 -m http.server 8000
```

## Check And Build

Node.js 18 or newer is required for these optional commands. They have no npm package dependencies.

```bash
npm run check
npm run build
```

The check script verifies the inline JavaScript syntax, unique IDs, internal links, accessibility references, section order, the exact video source, seven dossier sheets, seven stage controls and three demonstration panels. It also rejects one-time reveal settings and several unsupported claim patterns.

The build runs the same checks and writes **`dist/index.html`**. It is a static website artifact, not a server application. The build does not download, transcode or bundle external media and fonts.

To host it, use `npm run build` as the build command and `dist` as the output directory on a static host. Nothing has been published or deployed during this implementation.

## External Assets

- Video: the exact supplied URL, `https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/orchid/hero.mp4`.
- Fonts: Playfair Display and Inter, using the supplied Google Fonts family selections.
- Tailwind CSS v4 browser CDN.
- Motion 12.38.0 JavaScript browser API, using the same animation engine as its React package.
- Document artwork and interface icons: inline SVG and HTML/CSS within `index.html`.

The video is referenced remotely. A local `hero.mp4` was **not** downloaded by the available authoring tools. There is no alternate stock-video source. If it fails to load, the dark background and complete page content remain available.

## Page Structure

| Section | Interaction / composition |
| --- | --- |
| Hero | Playfair headline, light overlays from the reference, tiled-icon CTA, four working stage links |
| Condition | Three drifting document excerpts showing conflicting names, dates and amounts |
| Casework | Seven-file CSS 3D dossier with reversible opening, separation, exceptions, reconciliation, human verification and packaging |
| Capabilities | Expandable working index with small animated artifacts |
| Proof | Three interactive synthetic demonstrations |
| Principles | Unboxed typographic statements with repeating fine-line movement |
| Where | Multi-industry document support and an explicit professional-advice boundary |
| Scope and pricing | Scoping questions rather than invented fees or service guarantees |
| About | Ghulam Mustafa, Faisalabad, Pakistan, plus native accessible FAQs |
| Contact | Locally prepared enquiry, email handoff, copy and edit actions |

## Functional Details

- **Search:** the search icon and `/` or `Ctrl/Cmd+K` open a native dialog. It searches the actual capabilities, examples and sections.
- **Menu:** native modal behavior, Escape dismissal, focus return, and real destination anchors.
- **Dossier stage buttons:** each moves the page to that stage in the scroll sequence. The corresponding hero step links work the same way.
- **Consistency demonstration:** three incorrect working fields are corrected to the exact synthetic source values. Reset restores the discrepancies.
- **Extraction demonstration:** formats normalize while an unreadable amount remains unresolved. Sample CSV export labels the data as simulated.
- **Evidence demonstration:** adding synthetic Annex C changes the completeness count from six of seven to seven of seven. It explicitly does not mark the contents verified.
- **Enquiry:** input is validated and converted to an editable local draft. Nothing is claimed to be sent. Sending requires the visitor to open their email app or copy the text.

## Motion And Performance

The site uses Motion's `scroll()`, `animate()` and `inView()` APIs, not GSAP, Three.js or a WebGL renderer. A paused page does not create an unnecessary rendering loop for document animations. The video is the single shared visual anchor.

Scroll position deterministically controls the document scene. Ambient float transforms have separate parent/child layers from scroll transforms, so the two systems do not fight over element positions.

Ambient loops are paused outside the viewport, on a hidden browser tab, and when the visitor uses **Pause motion**. That button pauses video and idle motion without disabling user-controlled scroll storytelling.

The device's reduced-motion preference disables spatial animation and pauses the video. The dossier becomes a readable seven-stage outline. The same outline remains available to screen readers during the animated experience. If Motion fails to load, native navigation, search, examples and enquiry drafting still work.

## Content Integrity

All demonstration names, dates and amounts are synthetic and labeled. The site does not claim client volume, customer logos, testimonials, approval rates, guaranteed turnaround, certifications, security infrastructure or a free offer that has not been agreed.

Contact is limited to `daftrify.services@gmail.com`. Founder: Ghulam Mustafa. Base: Faisalabad, Pakistan.

## Verification Status

Source has been reviewed and the Motion package version and documented APIs were checked against their published references. The authoring environment did **not** provide a terminal, browser or the target laptop. Therefore the build script has not been executed here, and browser rendering, remote-video playback, keyboard behavior and frame rate are not reported as tested.

Before deployment, run the check/build commands and inspect 1440, 1280, 1024, 768, 480, 390 and 360px widths, including short landscape viewports.

1. Scroll down and back through every dossier stage. Confirm corrections rewind with the page.
2. Leave a visible document scene idle, then use Pause motion. Check that the background and floats stop and resume.
3. Test all three proof tabs, reset actions and CSV download.
4. Navigate the menu and search using only the keyboard, including Escape.
5. Submit an empty enquiry, then a valid one. Confirm the draft is explicitly unsent and editable.
6. Toggle reduced motion and block the Motion CDN. Confirm the static dossier remains readable.
7. Measure video decoding and scroll performance on the target low-power device. Adjust motion density if needed, rather than claiming an unmeasured frame rate.
