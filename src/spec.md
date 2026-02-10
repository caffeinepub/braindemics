# Specification

## Summary
**Goal:** Prevent BigInt JSON serialization errors during school registration and ensure demo-mode School records persist safely in localStorage.

**Planned changes:**
- Update Demo/Preview Mode localStorage persistence for School records to store bigint fields in a JSON-compatible format (e.g., strings) and convert them back to bigint when reading.
- Make loading/parsing of existing demo schools from localStorage backward-tolerant (handle previously stored numbers/strings without crashing).
- Adjust school registration error handling to avoid JSON-serializing raw objects that may contain bigint values, and display a clear English error message on failure.

**User-visible outcome:** In Demo/Preview Mode, users can register a new school without runtime errors, see saved schools persist across reloads, and get clear, stable error messages if registration fails.
