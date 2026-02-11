# Specification

## Summary
**Goal:** Move school registration to the Admin area and restrict Marketing users to view-only school details.

**Planned changes:**
- Move the “Register School” navigation entry from the Marketing UI to the Admin header navigation, so only Admin users see it.
- Update routing so the school registration page is under an Admin route (e.g., `/admin/...`), and prevent Marketing users from accessing the previous Marketing registration route (redirect to Marketing dashboard/authorized page).
- Make the School Details page view-only for Marketing by removing the Edit action/controls and keeping fields read-only for them (Admin edit flow remains unchanged).
- Enforce backend authorization so Marketing cannot create/register schools or update school details via API, while Admin retains these capabilities.

**User-visible outcome:** Admin users can register new schools and edit school details as before, while Marketing users can only view school details and can no longer see or access school registration or editing.
