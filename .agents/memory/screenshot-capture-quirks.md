---
name: Screenshot capture quirks
description: Why full-page app screenshots look broken here and how to get reliable captures and crops.
---

Full-page screenshots of the app leave lazy-loaded images blank and draw fixed elements (the floating support button) part-way down the page. These are capture artifacts, not layout bugs.
**Why:** several homepage checks looked broken until they were retaken with a tall viewport.
**How to apply:** to check below-the-fold sections, use a tall viewport (up to 3000px high) instead of fullPage. To inspect part of a long capture, crop it with ImageMagick `magick` (Python PIL is not installed). Keep captures in `generated-artifacts/` (git-ignored).
