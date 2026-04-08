# Channel-Based Programming Q&A Tool

A channel-based system for programming questions and threaded discussion.

Planned stack: **Next.js** + **MySQL** + **Docker Compose**

## Core Features

- Channels: browse + create ✓
- Posts: create questions/messages inside a channel ✓
- Replies: reply to posts and other replies (threaded) ✓
- Attachments: upload and display screenshots (PNG/JPEG/WebP)
- Voting: thumbs up/down on posts and replies (one vote per user per target) ✓
- Search: dedicated search page with pagination or “load more”

Security requirements (implemented in API layer): auth required for all write actions, input validation, safe rendering, safe uploads, basic rate limiting.

## Quick Start (Docker)

Prereqs: Docker + Docker Compose.

1) Start the app:

```bash
docker compose up --build
```

2) Open the app:

- Web: http://localhost (this repo currently maps container port 3000 to host port 80)

## Local Dev (No Docker)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Installation

Create a `.env` file in the project root:

```
# === App (nextjs service) === #

# `mysql` is docker compose service name
DATABASE_URL=mysql://qqusr:qqpw@mysql:3306/qqdb


# === MySQL (docker compose) === #

MYSQL_DATABASE=qqdb
MYSQL_USER=qqusr
MYSQL_PASSWORD=qqpw
MYSQL_ROOT_PASSWORD=qqrootpw

# === Auth (implement later) === #

SESSION_SECRET=dev-session
```

## Database (MySQL)

The DB schema and seed data will match the required minimum data model:

- User, Channel, Post, Reply, Vote, Attachment

Migrations + seed:

- Docker-first: migrations and seed run automatically on first boot

Admin credentials (seeded): **TBD**

## Seeded Data

The database is automatically seeded with:

- **Admin account**: admin@quequery.com / admin12345
- **User accounts**:
  - albert.smith@gmail.com / albert12345
  - jane.jones@gmail.com / jane12345
- **Channels** (2 channels)
- **Posts** (2 posts in each channel)

## Accounts + Admin

Implemented account features:

- Sign up, sign in, sign out
- Login required for all write actions (channels/posts/replies/votes/uploads)
- Passwords stored as hashes

Admin moderation (planned): remove users, channels, posts, and replies.

## Uploads (Screenshots)

Minimum constraints:

- Allowed: PNG, JPEG/JPG, WebP
- Max size: 5 MB per image
- Validate MIME type + extension
- Store safely (filesystem or DB) and serve via a controlled route

## Testing

Test report: **TBD**

## Search

- Substring search across posts + replies
- Content by a specific author
- Users with most/least posts (with counts)
- Highest-/lowest-ranked content (based on votes)

Searched fields + ranking formula: **TBD**

## Design Report

- Architecture overview
- DB (MySQL)
- API endpoints overview
- Upload storage approach
- Key packages

Design report: **TBD**

## Demo Video

10-minute demo video link: **TBD**
