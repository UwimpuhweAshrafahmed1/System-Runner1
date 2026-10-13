---
name: Shared header width budget
description: The homepage/gallery header has almost no spare width; read before adding nav links or changing header labels.
---

The shared header (logo, nav links, "Sign in", "Plan my care") was sized to just fit. By measurement on 2026-10-13, the five-link version needs about 1121px signed out, which is exactly where its hamburger breakpoint sits. When signed in, "My workspace" replaces "Sign in" and is about 50px wider.

**Why:** adding the "Before & After" link made the header overflow everywhere from 1121px to about 1375px, and the "Plan my care" button was cut off at the right edge. The fix uses a modifier class, applied only when the link is shown, that shifts the breakpoints. The published header without the link keeps its original breakpoints.

**How to apply:** after adding a nav link or lengthening a header label, take screenshots just above each header breakpoint. Budget for the signed-in label as well, because the screenshot tool is always signed out.

Unverified risk: from these measurements, the five-link header may clip "Plan my care" for signed-in users between about 1121px and 1170px. This was never checked in a browser.
