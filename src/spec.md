# Specification

## Summary
**Goal:** Build an internal, role-based school operations app with Internet Identity authentication, shared School ID workflows across departments, PDF handling for specific modules, and comprehensive audit logging.

**Planned changes:**
- Add a common login flow using Internet Identity that resolves the signed-in principal to exactly one staff role (Admin, Accounts, Packing, Marketing, Training, Academic) and redirects to the correct role dashboard; show an access-not-configured error for unregistered principals.
- Implement backend data models and stable persistence for School, Staff, Payment, Packing Status, Training Visit, Academic Query, and Audit Log, all linked via a shared School ID and timestamped.
- Enforce strict backend RBAC for all sensitive reads and all mutations; add frontend route guarding and hide/disable unauthorized UI actions.
- Build Admin-only Staff management to create/update staff profiles and map Internet Identity principals to roles for login-time role resolution.
- Create role-specific dashboards (six roles) with summary cards, relevant tables/lists, English loading/empty/error states, and Admin cross-department summaries plus an audit-log-based activity feed.
- Implement Marketing pages to create schools, edit school core details, and update student counts; ensure immediate visibility across roles via the shared School ID.
- Implement Accounts pages to manage school payments (amount, due date, status) and upload/download payment proof PDFs; prevent editing school core details.
- Implement Packing pages to manage kit/add-on counts, packing/dispatch status and dispatch details, and permitted theme fields; ensure updates are visible across departments and audited.
- Implement Training pages to log visits (required fields) and upload/download classroom observation PDFs; allow raising academic queries linked to schools.
- Implement Academic pages to list/filter academic queries, add responses, update status, and ensure fully auditable query lifecycle.
- Add global list/table pages with search + filtering for key entities and form-based validated data entry with clear English error handling.
- Add an Admin audit log viewer with pagination and filtering (actor, entity type, school ID, date range).
- Apply a clean, simple, responsive (desktop-first) UI theme consistently across dashboards, forms, and tables (avoiding a blue/purple-dominant theme).

**User-visible outcome:** Staff can sign in with Internet Identity, be routed to their role dashboard, work on the same schools using a shared School ID within their permitted module(s), upload/download PDFs only for payment proofs and classroom observations, and (for Admin) manage staff and review a filterable audit log of all actions.
