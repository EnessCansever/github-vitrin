# Local typefaces

These unmodified font files are distributed under SIL Open Font License 1.1.
The corresponding copyright and license notices are included beside each file.

| Use | File | Upstream |
| --- | --- | --- |
| Display, 800 | BarlowCondensed-ExtraBold.ttf | https://github.com/google/fonts/tree/main/ofl/barlowcondensed |
| Body, variable 200–800 | Manrope-Variable.ttf | https://github.com/google/fonts/tree/main/ofl/manrope |
| Metadata, 400 | IBMPlexMono-Regular.ttf | https://github.com/google/fonts/tree/main/ofl/ibmplexmono |

Downloaded on 2026-10-28. Turkish glyphs ÇçĞğİıÖöŞşÜü were checked in each font's cmap table.
Next.js serves the fonts locally through next/font/local; build and page rendering require no Google Fonts request.

The share-card renderer also uses the unmodified **Manrope-Medium.ttf** (500)
from [aaronbell/manrope at 468c0dbe](https://github.com/aaronbell/manrope/blob/468c0dbe38efa331b80bfe9448256abe27be44c3/fonts/ttf/manrope-medium.ttf), downloaded on 2026-10-29.
SHA-256: `502ee33a6e140ad6ef10ef8b762a8e5cf01f33316f318800795725f4cfd539d9`.
Its upstream OFL notice matches the existing `manrope-OFL.txt` (ignoring whitespace).
The static file avoids the renderer's variable-font `parseFvarAxis` failure; the UI keeps its existing variable font.
