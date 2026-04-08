# Channel-Based Programming Q&A Tool

Que-Query is a channel-based Q&A app for posting questions, threaded replies, voting, screenshots, and search.

## Current Features

- Channels: browse and create
- Posts: create questions and messages inside a channel
- Post screenshots: optional photo upload when creating a post only
- Replies: threaded replies under posts and nested replies under replies
- Voting: thumbs up/down on posts and replies
- Search: dedicated `/search` page with content search, author search, ranking views, channel filtering, and pagination for content results
- Auth: sign up, sign in, sign out, and write access protection
- Seeding: initial admin, user accounts, channels, and starter posts

## Setup

Create a `.env` file in the project root:

```env
# App
DATABASE_URL=mysql://qqusr:qqpw@mysql:3306/qqdb

# MySQL
MYSQL_DATABASE=qqdb
MYSQL_USER=qqusr
MYSQL_PASSWORD=qqpw
MYSQL_ROOT_PASSWORD=qqrootpw

# Auth
SESSION_SECRET=dev-session
```

## Run

Docker:

```bash
docker compose up --build
```

Local dev:

```bash
npm install
npm run dev
```

## Seeded Data

The database is seeded with:

- Admin: `admin@quequery.com` / `admin12345`
- Users: `albert.smith@gmail.com` / `albert12345`, `jane.jones@gmail.com` / `jane12345`
- Channels: 2
- Posts: 2 per channel

## Search Details

- Searched fields: `Post.title`, `Post.body`, `Reply.body`, `User.displayName`, `User.email`
- Ranking formula: `score = SUM(Vote.value)` for each content item
- Tie-breaks: newer content first when scores match
- Pagination: `page` query parameter plus `Load more`

## Notes

- Screenshots are stored in the database and served through a controlled API route.
- Attachments are limited to PNG, JPG/JPEG, and WebP files up to 5 MB.
