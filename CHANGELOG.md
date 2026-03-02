# Changelog

All notable changes to Ticketflow are documented in this file.

## [1.0.1] — 2026-03-02

### Fixed
- Remove negative left margin (`-ml-5`) on admin layout — content no longer feels stuck to edges
- Dashboard stat cards now use a clean, uniform white style instead of mixed color backgrounds

## [1.0.0] — 2026-02-25

### Added
- Full ticket lifecycle: open, in_progress, waiting, resolved, closed
- Client portal with magic-link (passwordless) authentication
- Admin dashboard with stats, recent tickets, and quick navigation
- Ticket detail view with threaded replies and internal notes
- File attachments (jpg, png, pdf, doc, xlsx, zip, csv — 10 MB max)
- Agent assignment and ticket reassignment
- Priority levels: low, normal, high, urgent
- Configurable categories (Allgemein, Rechnung, DATEV Export, Lizenz, Feature-Wunsch, Bug)
- SLA tracking with configurable response and resolve deadlines
- Auto-close tickets after configurable idle period
- Activity log / audit trail on every ticket
- Saved replies (canned responses) for agents
- Client management page with search and inline creation
- Email notifications: ticket created, reply added, status changed, assigned, closed
- HTML email templates with company branding
- Settings page: SLA, email, categories, file limits, accent color
- Role-based permissions: administrator, ticketflow_admin, ticketflow_agent, client
- Standalone templates (no WordPress theme dependency)
- DSGVO compliance: self-hosted Inter font, Datenschutz link in portal

### Fixed
- Fatal error from BaseController property conflict
- Script tags missing `type="module"` for Vite ES module output
- Attachments on new ticket form
- Cookie check error on portal
- Clear error message when email is not a registered client
