# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tech builders, developers, and students participating in peer skill-sharing, where any user can act as both a mentor and a learner/mentee depending on the skills they offer and seek.

## Product Purpose

MentorMatch connects mentors and learners in a shared community so they can discover relevant peers, send mentorship requests, schedule live sessions, collaborate through real-time chat and peer-to-peer video/screen sharing, and track mentorship impact over time. Success means moving seamlessly from discovering a peer to completing a focused live session without external tools.

## Positioning

An all-in-one real-time mentorship workflow—combining skill-based discovery and recommendations, request management, session scheduling with automated reminders, instant messaging, P2P WebRTC video with screen sharing, and post-session feedback and analytics—inside a single web application.

## Operating Context

- **Core routes & workflows:** Landing (`/`), authentication (`/sign-in`, `/sign-up`), mentor search (`/search`), personalized recommendations (`/recommendations`), mentorship requests (`/requests`), session scheduling and list (`/sessions`, `/sessions/schedule/[mentorId]`), live P2P WebRTC video calls (`/sessions/video-call/[sessionId]`), real-time chats (`/chats`, `/chats/[id]`), notifications (`/notifications`), profiles (`/profile`), and mentor analytics (`/analytics`).
- **Real-time & background infrastructure:** Dedicated Go WebSocket server (`server-go/` / `socket/`) for chat, presence, and WebRTC signaling; Redis caching and rate limiting; AWS EventBridge Scheduler and SQS worker for T-15m session reminders and session metrics.
- **Dev entrypoint:** `npm run dev` (Next.js App Router) or `npm run dev:all` (Next.js + Go WebSocket server).

## Capabilities and Constraints

- **Web-only:** Desktop and mobile web application built on Next.js App Router, React 19, TypeScript, Tailwind CSS v4, and Radix UI / shadcn/ui.
- **Free community model:** Community skill-sharing with no payments, pricing tiers, or billing UI.
- **Preserve existing auth and core flows:** Keep existing custom JWT/CSRF authentication and implemented mentorship, scheduling, chat, WebRTC, and analytics flows intact.
- **Undecided:** Whether formal WCAG compliance targets beyond baseline web accessibility apply.

## Brand Commitments

- **Product name:** MentorMatch (`MentorMatch - Learn from Experts, Share Your Skills`).
- **Existing visual documentation:** An internal visual guide exists at `docs/design.md` (not yet captured into `DESIGN.md`).

## Evidence on Hand

- **Real product & technical documentation:** `README.md`, `docs/architecture.md`, `docs/api-contracts.md`, `docs/design.md`.
- **Real implemented UI & routes:** `app/` pages and `components/` modules across landing, auth, search, recommendations, requests, sessions, video-call, chats, notifications, profile, and analytics.
- **Absences not to fabricate:** No verified customer testimonials, third-party user quotes, external company logos, press mentions, or commercial pricing/SLA claims are present in the repository and must not be invented.

## Product Principles

1. **One continuous workflow:** Keep discovery, coordination, live collaboration, and reflection connected without forcing users into external chat or video tools.
2. **Peer-first equality:** Support users fluidly across mentoring and learning roles rather than locking them into rigid buyer/seller hierarchies.
3. **Calm operational clarity:** Prioritize fast scanability, clear session states (`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), and distraction-free live collaboration.
4. **Honest community proof:** Rely on real session participation, active minutes, and post-session feedback rather than fabricated social proof or paywall prompts.

