# Changelog

All notable changes to Ticketflow are documented in this file.

## [1.1.1] — 2026-03-18

### Added
- Portal: paste-from-clipboard image support in new ticket form and reply box (Cmd+V / Ctrl+V)
- Portal: drag-and-drop file upload onto textarea (new ticket + reply)
- Portal: inline thumbnail previews with remove (×) button for attached files

## [1.1.0] — 2026-03-18

### Added
- Ticket export as ZIP (conversation .txt + all attachments in /attachments folder)
- "Aktiv" default filter on ticket list — hides closed/resolved tickets for admins
- Dashboard "Aktuelle Tickets" now excludes closed/resolved

### Changed
- Export button styled black for visibility
- Status filter defaults to "Aktiv" instead of "Alle Status"

## [1.0.9] — 2026-03-18

### Added
- Client detail page with ticket stats (total, open, closed) and ticket history table
- Company grouping — clients with same company name are merged into one entry in the Kunden list
- Company view on client detail: shows all contacts and combined tickets across the company
- Company field in "Add Client" form (optional)
- Client names clickable in ticket detail sidebar (links to client/company page)

### Changed
- Kunden list: company clients grouped into single row with contact avatars
- Removed "Neues Ticket" button from admin ticket list (only clients create tickets)

## [1.0.8] — 2026-03-18

### Added
- PDF attachments open in new browser tab instead of downloading
- Dashboard content constrained to 1300px, left-aligned

### Changed
- Attachment behavior: images → lightbox, PDFs → new tab, other files → download

## [1.0.7] — 2026-03-18

### Added
- Paste-from-clipboard image support in reply composer (Cmd+V / Ctrl+V)
- Drag-and-drop file upload onto textarea
- Inline thumbnail previews inside composer with remove (×) button
- Image lightbox — click image attachments to preview in overlay instead of broken download URL
- JS-based file download for all attachments (images via lightbox, non-images via blob download)

### Changed
- Reply composer layout: textarea with integrated drop zone, file previews between textarea and buttons
- Attachment download endpoint uses nonce auth (fixes 401 on direct URL access)

### Fixed
- Attachment download 401 error — fetch with WP nonce header instead of direct URL navigation

## [1.0.6] — 2026-03-16

### Added
- Internal note email notifications — all other admins/agents get notified when someone adds an internal note
- Priority badge (colored label) on new ticket and assignment email templates
- German status translations in status-change emails (Offen, In Bearbeitung, Wartend, Gelöst, Geschlossen)

### Changed
- All email templates and subject lines fully hardcoded in German (no i18n overhead)
- Admin email "Ticket anzeigen" button links to standalone dashboard instead of wp-admin
- File uploader: button-based trigger instead of label/form to prevent accidental page reloads
- Reply composer layout: file attach button and confirmation between textarea and action buttons
- Silent refetch after file upload — no loading spinner flash

### Fixed
- File upload causing apparent page reload (was loading spinner unmounting the view)

## [1.0.5] — 2026-03-16

### Added
- Company name field on client profiles (user meta, API, admin UI, WP user edit)
- New admin email template (`ticket-new-admin`) for new ticket notifications — shows client message preview (~50 words)
- Upload success confirmation (green checkmark) in file uploader
- Brand logo component replaces text branding throughout admin and portal

### Changed
- All email templates converted to German (hardcoded, no i18n overhead)
- Admin email "Ticket anzeigen" button now links to standalone dashboard instead of wp-admin
- Email header uses PNG logo on grey background instead of purple text header
- Email threading via In-Reply-To / References headers (Gmail groups by ticket)
- New ticket notification sent to all admins/agents, not just assigned agent
- Client replies notify all admins/agents
- Company name shown in ticket list, ticket detail sidebar, and email notifications
- Portal: removed Datenschutz footer and border, logo size increased
- Admin: removed avatar initials from header, logout stacked under username

### Fixed
- Attachment download 401 error — bypass REST nonce for direct browser download links
- Orphaned attachments now auto-link to reply on submission
- Duplicate attachment cleanup

## [1.0.4] — 2026-03-02

### Added
- Full German i18n for admin dashboard and client portal (lightweight `t()` function)
- German `.po/.mo` translation files for all PHP strings (emails, admin page, API errors)
- Locale detection from WordPress (`get_locale()`) passed to both SPAs
- ~160 React translation keys + ~90 PHP translation strings

### Changed
- Admin onboarding page CTA links now open in new tabs
- Email layout uses dynamic `lang` attribute from WordPress locale
- Email footer "All rights reserved." is now translatable

## [1.0.3] — 2026-03-02

### Added
- Settings: "Ticket Categories" is now its own section with explanation and example
- Settings: "Service Level Agreement (SLA)" section with description, all 3 fields inline
- Settings: hint text on Portal Accent Color field
- Dashboard stat cards: number displayed above label for better visual hierarchy
- Page titles (Dashboard, Tickets, Clients, Settings) use subtle uppercase style
- Installable `ticketflow.zip` included in repo — upload directly via WP Plugins > Add New

## [1.0.2] — 2026-03-02

### Added
- WP Admin onboarding page with stats, getting started guide, and "Launch Dashboard" CTA
- Status legend on Tickets page explaining each status
- Client management hints (roles, login flow, permissions)
- Activity log in ticket detail sidebar (replaces tabs)
- WP Admin and Logout links in sidebar footer
- User name and role in top-right header bar

### Changed
- Removed Saved Replies from navigation
- Clients page now includes both `ticketflow_client` and `subscriber` roles

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
