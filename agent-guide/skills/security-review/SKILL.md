---
name: security-review
description: Apply a lightweight security checklist to code and design.
---

1. Identify inputs and trust boundaries.
2. Look for unsafe string interpolation, command execution, and open redirects.
3. Confirm secrets are not stored in code.
4. Verify access control and validation assumptions.
5. Report anything that should be hardened before release.
