# MentorMatch Architecture & Project Structure Guide

This guide establishes the organization, folder conventions, and architectural boundaries of the MentorMatch codebase. When adding or modifying code, adhere strictly to these directory patterns.

---

## 1. High-Level Technology Stack

* **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Lucide Icons.
* **Backend (REST APIs):** Next.js Route Handlers (`app/api/**/route.ts`).
* **Real-Time Signaling & Chat:** Standalone Go WebSocket Server (`socket/`), integrated with Next.js client (`lib/ws/wsClient.ts`).
* **Video & Audio Calling:** WebRTC peer-to-peer with Go signaling server.
* **Database & ORM:** PostgreSQL hosted on Supabase/Neon via Prisma ORM 7.
* **Caching & Rate Limiting:** Redis (Upstash) via `ioredis` with TLS (`rediss://`).
* **Authentication:** JWT (Stateless 15m access token, 10d hashed refresh token session in PostgreSQL, HTTP-only SameSite cookies).

---

## 2. Directory Structure & File Placement Rules

```
MentorMatch/
├── app/                  # Next.js App Router (Pages, Layouts & API Routes)
├── components/           # UI Components (Organized by feature domain)
├── hooks/                # Custom React Hooks
├── lib/                  # Core singletons, infrastructure & utilities
├── redis/                # Centralized Redis connection, rate limiting & cache modules
├── services/             # Client-side API integration layer
├── types/                # Shared TypeScript interfaces & types
├── schema/               # Zod validation schemas
├── socket/               # Standalone Go WebSocket server
├── prisma/               # Database schema and migration history
├── public/               # Static assets (images, icons)
└── docs/                 # Engineering documentation & contracts
```

---

## 3. Detailed Folder Conventions

### 📁 `app/` (Pages and Route Handlers)
* **Purpose:** Handles routing, layouts, and server endpoints.
* **Rules:**
  * Route endpoints must live in `app/api/<resource>/route.ts`.
  * Frontend pages must be placed in semantic route folders:
    * `app/(auth)/`: Authentication pages (`/sign-in`, `/sign-up`).
    * `app/analytics/`: Mentor analytics dashboard.
    * `app/sessions/`: Session scheduling & list (`/sessions`).
    * `app/sessions/video-call/[sessionId]/`: Live WebRTC video call room.
    * `app/chats/` & `app/chats/[id]/`: Real-time chat threads.
    * `app/requests/`: Incoming and outgoing mentorship requests.
    * `app/profile/`: User profile management.
    * `app/search/`: Mentor discovery and skill search.
  * **Rule:** Do NOT place heavy business logic or raw database queries in page files; delegate to hooks or services.

---

### 📁 `services/` (Client API Integration Layer)
* **Purpose:** The **exclusive** place where frontend code calls backend `/api/...` routes.
* **Convention:** Named after the domain: `<feature>.service.ts`
* **Current Services:**
  * `account.service.ts`: Sign in, sign out, token refresh.
  * `analytics.service.ts`: Mentor performance metrics and feedback.
  * `session.service.ts`: Fetching, starting, confirming, completing calls.
  * `messages.service.ts`: Loading chats, message histories.
  * `mentorship-request.service.ts`: Sending and responding to requests.
  * `profile.service.ts`: Fetching and updating user profiles.
  * `notification.service.ts`: Fetching and marking notifications as read.
  * `videocall.service.ts`: WebRTC config and call room setup.
* **Rule:** Always use [`lib/axiosClient.ts`](file:///d:/CodeFiles/MentorMatch/lib/axiosClient.ts) inside services so requests benefit from automatic 401 interception and token refresh. Never make raw `fetch()` or `axios.get()` calls directly inside React components.

---

### 📁 `components/` (UI Components)
* **Purpose:** Reusable React components structured by domain.
* **Domain Folders:**
  * `components/analytics/`: Mentor analytics cards, trends, and review feeds.
  * `components/sessions/`: Session cards, session lists, status indicators.
  * `components/video-call/`: WebRTC video grids, media controls (mute/camera/screen share).
  * `components/chat/` & `components/messages/`: Chat room message bubbles, input bars, typing indicators.
  * `components/mentorship-request/` & `components/Request-Sidebar/`: Request forms, accept/reject dialogs.
  * `components/profile/`: Profile header, avatar, skill tags, stats widgets.
  * `components/layout/`: Global Navbar, navigation headers.
  * `components/retroui/`: Distinctive custom UI components (e.g. `Button.tsx`).
  * `components/ui/`: Generic Radix/Shadcn primitives (`card.tsx`, `badge.tsx`, `alert-dialog.tsx`, `spinner.tsx`, `popover.tsx`, `skeleton.tsx`).

---

### 📁 `redis/` (Caching, Rate Limiting & Performance)
* **Purpose:** Centralized Redis client, brute-force rate limiters, and domain-specific cache modules.
* **Root Files:**
  * `redis.ts`: `ioredis` client singleton with connection pooling, retry strategies, and TLS (`rediss://`).
  * `cache.ts`: Generic cache get/set/delete utilities, TTL jitter, and hit/miss telemetry tracking.
  * `auth-limiter.ts`: Login brute-force rate limiter (5 attempts per 15 min, fail-open resilience).
* **Subfolder `redis/cache/` (Domain Cache Modules):**
  * `analytics.ts`: Mentor analytics caching (5 min TTL) with event-driven invalidation.
  * `recommendations.ts`: Mentor recommendations caching (10 min TTL).
  * `sessions.ts`: Session state caching and participant invalidation.
  * `chats.ts`: Chat message cursor pagination cache.
  * `notifications.ts`: Unread notification count cache.
  * `mentorship-requests.ts`: Mentorship request caches.
  * `skills.ts`: Normalized skill lookup caches.
  * `call-presence.ts`: Active call room presence and heartbeat tracking.

---

### 📁 `lib/` (Core Infrastructure & Libraries)
* **Purpose:** Utilities, database clients, auth validators, and third-party wrappers.
* **Subfolders & Files:**
  * `lib/auth/`: JWT token signing, verification, CSRF token generation, password hashing, and cookie helpers (`auth.ts`).
  * `lib/ws/`:
    * `wsClient.ts`: Resilient WebSocket client with lazy token refresh (`getToken`) and auto-reconnection.
    * `chatSocket.ts`: Chat-specific socket connection manager.
  * `lib/helpers/`: Complex calculations (e.g., `recommendation.ts` mentor scoring algorithm, `skills.ts`).
  * `lib/prisma.ts`: Prisma Client singleton with connection pooling.
  * `lib/axiosClient.ts`: Preconfigured Axios instance with automatic 401 retry and silent refresh.

---

### 📁 `hooks/` (Custom React Hooks)
* **Purpose:** Encapsulates stateful logic and subscriptions.
* **Current Hooks:**
  * `useAuth.ts`: Checks current user authentication state and loading status.
  * `useWebRTC.ts`: Manages RTCPeerConnection, audio/video tracks, ICE candidates, and screen sharing.
  * `useChatSocket.ts`: Subscribes to real-time chat messages and typing indicators.
  * `useChatMessages.ts`: Manages paginated chat message state.

---

### 📁 `types/` (TypeScript Interfaces)
* **Purpose:** Single source of truth for shared data contracts.
* **Current Types:**
  * `analytics.ts`: Analytics response schemas.
  * `session.ts`: Session and call state types.
  * `profile.ts`: User profile, skills, and mentor models.
  * `ApiResponse.ts`: Standard generic API response wrapper.
  * `WebRTCConfig.ts`: ICE server and signaling types.

---

### 📁 `schema/` (Zod Schemas)
* **Purpose:** Request payload validation schemas used across API endpoints.
* **Current Schemas:**
  * `usercreationSchema.ts`: Registration and login payload validation.

---

### 📁 `socket/` (Go WebSocket Server)
* **Purpose:** High-performance Go microservice handling real-time WebSockets.
* **Files:**
  * `main.go`: Entry point and port configuration.
  * `server.go`: HTTP to WebSocket upgrader and JWT verification.
  * `handler.go`: WebRTC signaling (`webrtc:join`, `ice:candidate`) and chat routing.
  * `hub/`: Connection hub managing active client rooms.

---

## 4. Key Architectural Patterns to Remember

1. **Authentication Flow:**
   * Standard endpoints verify the `accessToken` via `getSessionFromRequest(req)`.
   * When an access token expires, `axiosClient` catches the `401`, calls `/api/auth/refresh`, gets new cookies, and replays the original request seamlessly.
   * `WsClient` uses `getToken: refresh` so WebSocket connections never drop after 15 minutes.
2. **Caching Strategy:**
   * Caching is layered on top of Redis (`redis/cache.ts`).
   * When data changes (reviews submitted, calls completed, profiles edited), corresponding domain cache modules (`redis/cache/analytics.ts`, `recommendations.ts`, `sessions.ts`) are proactively invalidated.
3. **Adding a New Feature Checklist:**
   * 1. Add model changes in `prisma/schema.prisma` if needed.
   * 2. Define types in `types/<feature>.ts`.
   * 3. Add API route in `app/api/<feature>/route.ts`.
   * 4. Add client API call in `services/<feature>.service.ts`.
   * 5. Build modular UI components in `components/<feature>/`.
   * 6. Render in `app/<feature>/page.tsx`.

