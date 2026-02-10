# Specification

## Summary
**Goal:** Improve school selection/search across modules, extend Packing status with class/theme + counts, add Outstanding Amount management, and ensure Demo/Preview mode works end-to-end with locally persisted data.

**Planned changes:**
- Update the Packing page to include a searchable school select (not only route-param driven), show the selected school’s details read-only, and display an empty state when no school is selected.
- Extend Packing status editing to include Class and Theme dropdowns with the exact requested option sets, and persist/reload these values per school (with existing RBAC rules for who can update).
- Add a clearly labeled counts section on the Packing page for the selected school; validate inputs (no negative values) and persist/reload counts along with packing status updates.
- Add an Admin workflow to search/select a school and set/update a per-school Outstanding Amount, with selected school details displayed read-only and access restricted to Admin.
- Display a selected school’s Outstanding Amount as read-only in the Marketing module (showing either 0 or “Not set” consistently when absent).
- Make Demo/Preview Mode support end-to-end flows without backend access: registering schools (Marketing and Admin entry points), reflecting new schools across modules, updating/reviewing Outstanding Amount, and saving/reloading Packing edits (class/theme/counts/packing details) using demo-local persisted data.
- Allow Admin to register/create schools in non-demo mode (backend + frontend entry point), and ensure new schools appear across module school searches/lists with RBAC enforced.

**User-visible outcome:** Users can search/select schools in Packing and Admin workflows, update packing status with class/theme and counts, manage and view Outstanding Amount across Admin and Marketing, and complete these flows reliably in Demo/Preview mode with data persisting locally and reflecting across pages.
