---
name: Artifact build environments
description: Build-time environment requirements for Vite artifacts in this workspace.
---

Vite artifacts in this workspace require their own configured `PORT` and `BASE_PATH`. A recursive workspace build runs these packages without each artifact's managed service environment and can fail in an unrelated artifact before reaching the target.

**Why:** A workspace-wide build failed because the mockup sandbox required its artifact-specific build variables; setting only `PORT` exposed its missing `BASE_PATH`. Building MediMATCH and the API packages directly succeeded.

**How to apply:** For build verification, read the target artifact's service environment and build that package with those values. Treat failures in unrelated artifact packages separately.
