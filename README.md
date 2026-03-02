# Ticketflow

Agency ticket system for WordPress. A self-hosted support portal and admin dashboard built as a single WordPress plugin.

## Features

- **Client portal** — Customers log in via magic link (passwordless), create tickets, reply, attach files
- **Admin dashboard** — Staff view all tickets, assign agents, track SLA, manage clients
- **Threaded replies** with internal notes (visible only to staff)
- **File attachments** — jpg, png, pdf, doc, xlsx, zip, csv (10 MB max)
- **SLA tracking** — Configurable response and resolve deadlines
- **Auto-close** — Tickets in "resolved" status auto-close after configurable idle period
- **Saved replies** — Canned responses for common questions
- **Email notifications** — Ticket created, reply added, status changed, assigned, closed
- **Activity log** — Full audit trail on every ticket
- **Role-based access** — Admin, agent, and client roles with granular capabilities
- **Standalone templates** — No WordPress theme dependency, clean standalone pages
- **DSGVO compliant** — Self-hosted fonts, privacy link in portal

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | WordPress plugin, PHP 8.0+, PSR-4 autoload (Composer) |
| Frontend | React 18, TypeScript, Tailwind CSS 3 |
| Build | Vite 5 |
| Auth | Magic link (passwordless email) + WordPress cookie sessions |
| API | WordPress REST API (`/wp-json/ticketflow/v1/`) |

## Project Structure

```
ticketflow/
├── ticketflow.php               # Plugin entry point
├── src/                         # Frontend source (React/TS)
│   ├── admin/                   # Admin dashboard SPA
│   ├── portal/                  # Client portal SPA
│   └── shared/                  # Shared components, hooks, API
├── includes/                    # PHP backend
│   ├── Admin/                   # WP admin menu + dashboard template
│   ├── API/                     # REST API controllers
│   ├── Auth/                    # Magic link + permissions
│   ├── Database/                # Schema + migrations
│   ├── Email/                   # Email manager + templates
│   ├── Models/                  # Ticket, Reply, Attachment, etc.
│   ├── Services/                # Business logic
│   └── Shortcodes/              # Portal shortcode + template
├── assets/                      # Built frontend (Vite output)
├── public/                      # Static assets (fonts)
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── CHANGELOG.md
└── README.md
```

## Setup

### Requirements

- WordPress 6.0+
- PHP 8.0+
- Node.js 18+ (for building frontend)
- Composer (for PHP autoload)

### Install

1. Clone this repo into `wp-content/plugins/ticketflow/`
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Build the frontend:
   ```bash
   npm run build
   ```
5. Activate the plugin in WordPress admin
6. On activation, the plugin creates:
   - 7 database tables (`wp_ticketflow_*`)
   - A "Support Portal" page (client-facing)
   - A "Ticketflow" page (admin dashboard)
   - Custom roles and capabilities

### Development

```bash
npm run dev          # Vite dev server with HMR
npm run build        # Production build (both admin + portal)
npm run build:admin  # Build admin dashboard only
npm run build:portal # Build client portal only
```

### Deploy

```bash
rsync -avz --delete -e 'ssh -p 65002' \
  ./ \
  user@server:path/to/wp-content/plugins/ticketflow/ \
  --exclude='node_modules' --exclude='src' --exclude='.git' --exclude='*.md'
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `ticketflow_tickets` | Tickets with UID, subject, status, priority, SLA deadline |
| `ticketflow_replies` | Threaded replies + internal notes |
| `ticketflow_attachments` | File uploads linked to tickets/replies |
| `ticketflow_activity_log` | Audit trail (status changes, assignments) |
| `ticketflow_magic_tokens` | Passwordless auth tokens |
| `ticketflow_saved_replies` | Canned responses for agents |
| `ticketflow_ticket_meta` | Extensible key/value metadata |

## REST API

All endpoints under `/wp-json/ticketflow/v1/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/magic-link` | Request magic link email |
| GET | `/auth/me` | Current user info |
| GET | `/tickets` | List tickets (filtered, paginated) |
| POST | `/tickets` | Create ticket |
| GET | `/tickets/:id` | Get ticket detail |
| PATCH | `/tickets/:id` | Update ticket |
| POST | `/tickets/:id/close` | Close ticket |
| POST | `/tickets/:id/reopen` | Reopen ticket |
| POST | `/tickets/:id/assign` | Assign agent |
| GET/POST | `/tickets/:id/replies` | List/add replies |
| POST | `/tickets/:id/attachments` | Upload file |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET/POST | `/saved-replies` | Manage canned responses |
| GET/PUT | `/settings` | Plugin settings |

## License

GPL-2.0-or-later
