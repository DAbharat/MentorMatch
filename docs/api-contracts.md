# MentorMatch API Contracts & Specifications

This document catalogs every API route in MentorMatch, including its HTTP methods, URL parameters, request payloads, response bodies, and HTTP status codes.

---

## 1. Authentication & Session Management

### `POST /api/auth/register`
Creates a new user account, hashes the password, sets HTTP-only JWT cookies, and provisions a refresh session.
* **Auth Required:** No
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Responses:**
  * `201 Created` / `200 OK`:
    ```json
    {
      "message": "User registered successfully.",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
    ```
    *Cookies Set:* `accessToken` (15m), `refreshToken` (10d), `csrfToken`.
  * `400 Bad Request`: Validation failure or duplicate email (`Unique constraint violation`).
  * `500 Internal Server Error`: Server error creating user.

---

### `POST /api/auth/login`
Authenticates a user via email and password with rate limiting (5 attempts per 15 mins).
* **Auth Required:** No
* **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Responses:**
  * `200 OK`:
    ```json
    {
      "message": "User logged in successfully",
      "user": {
        "id": "uuid",
        "email": "jane@example.com",
        "name": "Jane Doe"
      }
    }
    ```
    *Cookies Set:* `accessToken` (15m), `refreshToken` (10d), `csrfToken`.
  * `400 Bad Request`: Invalid credentials or missing fields.
  * `429 Too Many Requests`: Account temporarily locked due to failed attempts.
  * `500 Internal Server Error`: Database or internal error.

---

### `POST /api/auth/refresh`
Rotates the refresh token (hashes in DB), issues a fresh 15-minute access token, and checks for token replay attacks.
* **Auth Required:** Yes (`refreshToken` cookie)
* **Request Body:** None (reads `refreshToken` cookie)
* **Responses:**
  * `200 OK`:
    ```json
    {
      "message": "Token refreshed",
      "accessToken": "eyJhbGciOi..."
    }
    ```
    *Cookies Set:* New `accessToken` and rotated `refreshToken`.
  * `401 Unauthorized`: Token missing, expired, or replay detected (invalidates all sessions).
  * `500 Internal Server Error`: Server error during rotation.

---

### `POST /api/auth/logout`
Terminates the user's active session in PostgreSQL and clears authentication cookies.
* **Auth Required:** Yes (`refreshToken` cookie)
* **Request Body:** None
* **Responses:**
  * `200 OK`:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
    *Cookies Deleted:* `accessToken`, `refreshToken`, `csrfToken`.
  * `401 Unauthorized`: No active session cookie present.

---

## 2. Mentors & Discovery

### `GET /api/mentors/analytics`
Fetches comprehensive mentor statistics: session volume, total hours, unique mentees, ratings breakdown, confidence boost, and recent reviews.
* **Auth Required:** Yes (`accessToken`)
* **Responses:**
  * `200 OK`:
    ```json
    {
      "overview": {
        "totalCompletedSessions": 12,
        "totalActiveHours": 8.5,
        "totalActiveMinutes": 510,
        "uniqueMenteesCount": 9,
        "upcomingSessionsCount": 2,
        "cancelledSessionsCount": 1,
        "averageRating": 4.9,
        "totalReviewsCount": 10,
        "averageConfidenceGain": 2.1
      },
      "ratingDistribution": { "1": 0, "2": 0, "3": 0, "4": 2, "5": 8 },
      "monthlyTrends": [
        { "label": "Jun 2026", "sessions": 1, "minutes": 45 },
        { "label": "Jul 2026", "sessions": 3, "minutes": 120 }
      ],
      "skillsBreakdown": [
        {
          "skillId": "uuid",
          "skillName": "React",
          "completedSessions": 8,
          "totalMinutes": 360,
          "feedbackCount": 7,
          "averageRating": 4.9
        }
      ],
      "recentFeedback": [
        {
          "id": "uuid",
          "rating": 5,
          "comment": "Outstanding session, deeply cleared my doubts!",
          "confidenceBefore": 2,
          "confidenceAfter": 5,
          "createdAt": "2026-11-01T12:00:00Z",
          "skill": { "id": "uuid", "name": "React" },
          "mentee": { "id": "uuid", "name": "Alex" }
        }
      ]
    }
    ```
  * `401 Unauthorized`: Not authenticated.
  * `404 Not Found`: Mentor user not found.

---

### `GET /api/mentors/recommendations?limit=10`
Generates personalized mentor recommendations based on the mentee's `skillsWanted`, mentor ratings, completed sessions, and historical confidence gains. Cached in Redis for 10 minutes.
* **Auth Required:** Yes (`accessToken`)
* **Query Params:** `limit` (default: 10, max: 50)
* **Responses:**
  * `200 OK`:
    ```json
    {
      "message": "Recommendations fetched successfully",
      "data": [
        {
          "id": "uuid",
          "name": "Sarah Connor",
          "bio": "Senior Staff Engineer",
          "skillsOffered": [{ "id": "uuid", "name": "Go" }],
          "averageRating": 5.0,
          "ratingCount": 14,
          "completedSessionsCount": 20,
          "matchScore": 88.5
        }
      ],
      "totalFound": 5,
      "hasWantedSkills": true
    }
    ```
  * `401 Unauthorized`: Not authenticated.
  * `404 Not Found`: Mentee not found.

---

### `GET /api/users`
Searches and lists mentors and users with optional filtering.
* **Auth Required:** No
* **Query Params:** `search`, `skill`, `page`, `limit`
* **Responses:**
  * `200 OK`: List of users matching search query.

---

## 3. Mentorship Requests

### `GET /api/mentorship-requests`
Fetches all mentorship requests where the authenticated user is either mentor or mentee.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "requests": [...] }`

### `GET /api/mentorship-requests/received`
Fetches pending mentorship requests received as a mentor.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "requests": [...] }`

### `GET /api/mentorship-requests/sent`
Fetches pending mentorship requests sent as a mentee.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "requests": [...] }`

### `POST /api/users/[mentorId]/mentorship-request`
Sends a new mentorship request to a specific mentor.
* **Auth Required:** Yes
* **Request Body:**
  ```json
  {
    "skillId": "uuid",
    "title": "Need guidance on microservices",
    "message": "Hi, I would love some advice on Go concurrency and Redis caching.",
    "preferredTime": "2026-11-20T15:00:00Z"
  }
  ```
* **Responses:**
  * `201 Created`: Created mentorship request object.
  * `400 Bad Request`: Cannot request yourself or duplicate pending request exists.

### `PATCH /api/mentorship-requests/[requestId]`
Accepts or rejects a mentorship request. Accepting automatically schedules a `Session`.
* **Auth Required:** Yes
* **Request Body:**
  ```json
  {
    "action": "ACCEPT" // or "REJECT"
  }
  ```
* **Responses:**
  * `200 OK`: `{ "message": "Request accepted", "session": { ... } }`
  * `403 Forbidden`: Authenticated user is not the designated mentor.

---

## 4. Sessions & WebRTC Calling

### `GET /api/sessions`
Fetches all sessions (upcoming, confirmed, in-progress, completed) for the current user.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "sessions": [...] }`

### `GET /api/sessions/[sessionId]`
Fetches details and active state of a specific session.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: Session object including room ID, participants, and duration.
  * `404 Not Found`: Session does not exist.

### `PATCH /api/sessions/[sessionId]`
Updates session lifecycle state (`CONFIRM`, `START`, `CANCEL`, `COMPLETE`).
* **Auth Required:** Yes
* **Request Body:**
  ```json
  {
    "action": "START" // "CONFIRM" | "START" | "CANCEL" | "COMPLETE",
    "isAutoEnd": false
  }
  ```
* **Responses:**
  * `200 OK`: Updated session record.
  * `400 Bad Request`: Invalid transition.

### `GET /api/sessions/[sessionId]/webrtc/config`
Generates ICE/STUN/TURN server configurations and room join permissions.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`:
    ```json
    {
      "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
      ],
      "role": "MENTOR",
      "sessionId": "uuid",
      "roomId": "room_xyz"
    }
    ```

### `POST /api/call-events/[sessionId]`
Logs WebRTC signaling, network quality, and join/leave telemetry events.
* **Auth Required:** Yes
* **Request Body:**
  ```json
  {
    "eventType": "JOIN" // "LEAVE" | "ICE_DISCONNECT" | "MUTE"
  }
  ```
* **Responses:**
  * `200 OK`: `{ "status": "recorded" }`

### `POST /api/sessions/cleanup-stuck`
System maintenance endpoint to auto-close orphaned or crashed calls.
* **Auth Required:** Yes

---

## 5. Feedback & Reviews

### `POST /api/users/[mentorId]/feedback`
Submits feedback and ratings for a completed session.
* **Auth Required:** Yes (Mentee only)
* **Request Body:**
  ```json
  {
    "sessionId": "uuid",
    "skillId": "uuid",
    "rating": 5,
    "comment": "Explained concepts with great practical examples!",
    "confidenceBefore": 2,
    "confidenceAfter": 5
  }
  ```
* **Responses:**
  * `201 Created`: Created feedback object. Recalculates mentor's `averageRating`.
  * `400 Bad Request`: Feedback already submitted for this session.

### `GET /api/users/[mentorId]/feedback`
Fetches reviews and ratings received by a mentor.
* **Auth Required:** No
* **Responses:**
  * `200 OK`: List of public feedback and average rating.

---

## 6. Real-Time Chat & Messages

### `GET /api/chats`
Fetches all active chat conversations for the user.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: List of user chats with latest message preview and unread counts.

### `GET /api/chats/[chatId]/messages?cursor=&limit=30`
Fetches paginated message history for a conversation. Cached in Redis.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "messages": [...], "nextCursor": "uuid" }`

### `POST /api/chats/[chatId]/messages`
Sends a message in a chat room and broadcasts via WebSocket.
* **Auth Required:** Yes
* **Request Body:**
  ```json
  {
    "content": "Looking forward to our call tomorrow!"
  }
  ```
* **Responses:**
  * `201 Created`: Saved message object.

### `PATCH /api/chats/[chatId]/messages/read`
Marks all incoming messages in a conversation as read.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "success": true }`

---

## 7. User Profile

### `GET /api/user/profile`
Fetches the full authenticated profile, skills offered, skills wanted, and session stats.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: User profile object.

### `PATCH /api/user/profile`
Updates profile details, bio, and offered/wanted skills. Invalidates recommendation cache.
* **Auth Required:** Yes
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "bio": "Full-stack developer with 6+ years of React and Go experience.",
    "skillsOffered": ["React", "TypeScript", "Node.js"],
    "skillsWanted": ["Kubernetes", "Rust"]
  }
  ```
* **Responses:**
  * `200 OK`: `{ "message": "Profile updated successfully", "user": { ... } }`

---

## 8. Notifications

### `GET /api/notifications`
Fetches notifications for session requests, reminders, confirmations, and feedback.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "notifications": [...], "unreadCount": 3 }`

### `PATCH /api/notifications/read-all`
Marks all notifications as read.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "success": true }`

### `PATCH /api/notifications/[id]/read`
Marks a single notification as read.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "success": true }`

### `DELETE /api/notifications/[id]`
Deletes a notification.
* **Auth Required:** Yes
* **Responses:**
  * `200 OK`: `{ "message": "Notification deleted" }`

---

## 9. System & Health

### `GET /api/health`
Checks system health (PostgreSQL connectivity and latency).
* **Responses:**
  * `200 OK`: `{ "status": "healthy", "timestamp": "...", "database": "connected" }`

### `GET /api/health/cache`
Checks Redis connectivity, hit rates, and latency.
* **Responses:**
  * `200 OK`: `{ "status": "ok", "redis": "connected", "stats": { "hits": 142, "misses": 18 } }`

