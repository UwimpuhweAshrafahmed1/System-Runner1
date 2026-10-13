---
name: Before & After illustration QA
description: Rules and generation quirks for adding or replacing gallery illustrations (identity match, no skin lightening, raw renders).
---

Every before/after pair must pass these checks before it is used:
- Same fictional person, pose, framing, lighting and background, with only the treatment area changed and the change plausible.
- On sampled skin regions, the after image must not have a higher lightness (L*) than the before image. The current set is 0.4–1.3 L* darker after, never lighter.
- No stray text from the generator.
- Internal procedures are shown as labelled anatomical models, not as faces.

**Why:** the user's brief forbids implying that treatment lightens skin and requires each pair to be the same model. The disclosure is also burned into the image pixels, so images must be regenerated through the pipeline script, never edited by hand.

**How to apply:**
- Make the "after" image by editing the "before" render. This keeps the person's identity.
- Prompts asking for a stylised 3D look still produced photoreal images. Do not spend retries on style; the burned-in badge and the page disclosures handle this.
- The raw 1024px renders exist only in the gitignored generated-artifacts folder. If they are gone, the labels and badge cannot be redrawn without generating the images again.
- A new illustration ships with clinicalReview "pending" and needs a clinician's approval before it appears on the published site.
