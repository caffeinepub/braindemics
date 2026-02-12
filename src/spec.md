# Specification

## Summary
**Goal:** Fix the Admin page initial-load crash (“Minified React error #185” invalid hook call) so the Admin dashboard renders successfully on first load, and improve error boundary diagnostics for future occurrences.

**Planned changes:**
- Identify and correct the invalid React hook usage along the Admin page’s initial render path so hooks are only called from valid function components or custom hooks and not in invalid contexts (module scope, non-component functions, or invalid conditional patterns).
- Ensure opening the app directly on the Admin route no longer triggers the GlobalErrorBoundary or logs React error #185 to the console.
- Improve the GlobalErrorBoundary “Technical Details” output to include actionable debugging information (raw error message and component stack when available) while ensuring the error boundary itself never throws and all user-facing strings remain in English.

**User-visible outcome:** Visiting the Admin page as the first route loads the Admin dashboard normally (no crash screen), and if any future crash happens, “Technical Details” shows useful error information without breaking the page.
