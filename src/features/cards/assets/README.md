# Share card print material

`letterpress-paper.jpg` is a text-free grayscale paper texture generated for this
project with the built-in imagegen tool on 2026-10-29. It contains no branding,
profile information, numbers or source reference artwork. No third-party stock
texture was downloaded. The generated PNG was encoded as a grayscale JPEG at
quality 90 with the already installed Sharp tool for a smaller local asset.

SHA-256: `5dda8155d3ee8b97dd56d2be961c2199a21a85279e2e6857f7838cc377e123c7`.

Both card formats map its luminance through fixed SVG color matrices to paper
fibers and faint ink wear. They load this file locally; image generation is never
called during rendering. All report text remains dynamic. The concept-panel crop
is a review artifact in /tmp and is not used by either renderer. Since 2026-10-31,
landscape uses this same material and fixed masks in its own 1200×630 SVG. Story
retains its 1080×1920 mapping; identical-input PNG equality was checked.
