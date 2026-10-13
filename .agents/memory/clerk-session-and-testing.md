---
name: Clerk session claims and signed-in testing
description: What the Clerk session token really contains here, how to test signed-in API calls without a browser, and timing rules for UI test plans.
---

## Session token has no profile claims
On this Clerk dev instance (checked 2026-10-13) the session JWT carries only sub, sid, iss, exp, iat, nbf, fva, sts, v (plus `agt` for test-agent sessions). There is no email, firstName, lastName or userId claim, even though the clerk-auth skill describes a pre-configured token with them.
**Why:** the first version read email from claims, so every account was saved as "MediMATCH member" with a placeholder email and the admin bootstrap could never match.
**How to apply:** server code that needs a user's email or name must use the Clerk Backend API (`clerkClient.users.getUser`). Keep reading claims first in case a custom session token is configured later.

## Testing signed-in API routes without a browser
Find the user's active session with Clerk Backend API `GET /v1/sessions?user_id=...&status=active`, mint a JWT with `POST /v1/sessions/{id}/tokens`, then call `http://localhost:8080/api/...` with `Authorization: Bearer <jwt>`. Run it inside a node script so the secret key and token are never printed.

## UI test plans
Clerk takes several seconds to load on each full page load in development. Assertions about redirects after sign-in (for example `/login` → workspace) must wait up to about 15 seconds, or the tester reports a false failure.
Emails are stored lowercased, so DB checks should compare with `lower(...)`.
Delete test users afterwards from both `medimatch_users` (appointments cascade) and Clerk, so they do not show up in the CEO team-access panel.
