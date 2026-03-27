# MentorMatch - Mentorship Platform

A modern, real-time mentorship platform that connects mentors and mentees for skill-sharing and professional development. Built with Next.js, real-time WebSocket communication, and video conferencing capabilities.

## Overview

MentorMatch is a comprehensive mentorship application designed to facilitate meaningful connections between experienced professionals (mentors) and learners (mentees). The platform provides tools for skill matching, session scheduling, real-time communication, and performance feedback to create an effective learning environment.

## Key Features

- **User Authentication & Profiles**: Secure authentication via Clerk with comprehensive user profiles including skills, ratings, and feedback history
- **Skill Matching**: Intelligent skill matching system connecting mentors offering specific skills with mentees seeking to learn them
- **Mentorship Requests**: Structured mentorship request workflow with acceptance/rejection capabilities and customizable messages
- **Session Scheduling**: Calendar-based session scheduling with confirmation workflows and automated reminders
- **Video Conferencing**: High-quality HD video calls powered by WebRTC with real-time call quality metrics
- **Real-Time Chat**: Socket.io-powered instant messaging between mentors and mentees with delivery and read status tracking
- **Video Call Analytics**: Comprehensive call metrics including duration, active participation time, and participant statistics
- **Feedback System**: Post-session feedback collection with ratings, comments, and confidence assessments
- **Notifications**: Real-time notifications for mentorship requests, session updates, and feedback submissions
- **User Search**: Advanced search functionality to discover mentors by skills and profile information
- **Rating & Reviews**: User rating system and feedback history for transparency and accountability

## Tech Stack

### Frontend & Full Stack
- **Next.js 16.1**: Modern React framework with server components and API routes
- **React 19**: Latest React for UI component development
- **TypeScript**: Type-safe code across the entire application
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: High-quality, accessible React components built on Radix UI
- **Radix UI**: Accessible component primitives
- **Zod**: Runtime schema validation for API endpoints

### Real-Time Communication
- **Socket.io**: Bidirectional WebSocket communication for real-time chat and notifications
- **WebRTC**: Peer-to-peer video conferencing and media streaming

### Authentication & Database
- **Clerk**: Modern authentication and user management
- **PostgreSQL**: Robust relational database via Prisma adapter
- **Prisma ORM**: Type-safe database access and migrations

### Development Tools
- **ESLint**: Code quality and consistency
- **Axios**: HTTP client for API calls
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd productfeed
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure the following in `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/productfeed

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

### Development

Start the development server and WebSocket server in parallel:

```bash
npm run dev:all
```

Or run them separately:

```bash
# Frontend (Next.js)
npm run dev

# WebSocket Server (runs on port 4000)
npm run dev:socket
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
productfeed/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── chats/               # Chat endpoints
│   │   ├── sessions/            # Session management
│   │   ├── mentorship-requests/ # Mentorship request endpoints
│   │   ├── notifications/       # Notification endpoints
│   │   └── user/                # User endpoints
│   ├── (auth)/                  # Authentication pages
│   ├── (landing)/               # Landing pages
│   ├── chats/                   # Chat UI pages
│   ├── sessions/                # Session pages
│   ├── profile/                 # User profile pages
│   ├── notifications/           # Notification pages
│   └── search/                  # Search functionality
├── components/                   # Reusable React components
│   ├── chat/                    # Chat related components
│   ├── feedback/                # Feedback UI components
│   ├── layout/                  # Layout components
│   ├── mentorship-request/      # Mentorship request components
│   ├── messages/                # Message components
│   ├── notifications/           # Notification components
│   ├── profile/                 # Profile UI components
│   ├── sessions/                # Session related components
│   ├── video-call/              # Video call UI components
│   └── ui/                      # Base UI components (shadcn/Radix)
├── lib/                         # Utility functions
│   ├── prisma.ts               # Prisma client
│   ├── chatSocket.ts           # Socket.io client utilities
│   ├── session-metrics.ts      # Calculate session duration
│   └── utils.ts                # Helper functions
├── services/                    # Business logic services
│   ├── session.service.ts      # Session management
│   ├── messages.service.ts     # Message operations
│   ├── feedback.service.ts     # Feedback management
│   ├── notification.service.ts # Notification handling
│   └── profile.service.ts      # User profile operations
│   ├── mentorship-requests.service.ts # Request management
│   └── videocall.service.ts      # Starting Video Call
├── socket/                      # WebSocket server
│   └── server.ts               # Socket.io server implementation
├── prisma/                      # Database
│   ├── schema.prisma           # Data models
│   └── migrations/             # Database migrations
├── hooks/                       # Custom React hooks
└── schema/                      # Zod validation schemas
```

## Core Services & API Endpoints

### Authentication
- Clerk-based authentication system
- User profile creation and management
- Secure session handling

### Chat Service
- Real-time messaging via Socket.io
- Message delivery and read status tracking
- Skill-based chat rooms

### Session Management
- Schedule mentorship sessions
- Confirm/cancel sessions
- Track call metrics and participation
- Generate session analytics

### Mentorship Requests
- Send/receive mentorship requests
- Accept/reject requests
- Customizable initial messages

### Notifications
- Real-time notification delivery
- Multiple notification types (session updates, feedback, requests)
- Read status tracking

### User Search
- Search mentors by skills
- Filter by ratings and availability
- Advanced profile discovery

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts with ratings and skills
- **Skill**: Skills offered and wanted by users
- **Session**: Scheduled mentorship sessions with metrics
- **Chat**: Real-time chat conversations
- **Message**: Individual messages with delivery tracking
- **MentorshipRequest**: Mentorship request workflow
- **UserFeedback**: Post-session feedback and ratings
- **Notification**: User notifications
- **CallEvent**: Video call event tracking

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Frontend & API
Deployed on Vercel with automatic deployments on git push.

### WebSocket Server
Deployed on Render as a background worker for real-time communication.

**Live App**: https://mentor-match-taupe.vercel.app

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes |

## Performance Considerations

- **Session Metrics**: Computed asynchronously to avoid blocking operations
- **Message Indexing**: Database indexes on frequently queried fields (userId, chatId, timestamps)
- **Real-Time Updates**: Socket.io namespaces for efficient event broadcasting
- **Call Quality**: WebRTC provides peer-to-peer optimization with adaptive bitrate control

## Security Features

- Type-safe API endpoints with Zod validation
- Clerk authentication and authorization
- Secure WebSocket connections with token verification
- SQL injection prevention via Prisma ORM
- Environment variable abstraction for sensitive data

## Available Scripts

```bash
npm run dev          # Start Next.js dev server
npm run dev:socket   # Start WebSocket server on port 4000
npm run dev:all      # Start both servers concurrently
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Troubleshooting

### WebSocket Connection Issues
- Verify Render WebSocket server is running
- Check CORS origins in socket/server.ts
- Ensure environment variables are set correctly

### Database Connection
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Run `npx prisma migrate dev` to sync schema

### Video Call Issues
- Check browser permissions for camera/microphone
- Test network connectivity and firewall settings
- Verify WebRTC peer connection establishment

## Future Enhancements

- Advanced skill matching algorithms
- AI-powered session recommendations
- Session recordings and replay
- Peer rating and review system
- Mobile app development
- Integration with calendar services
- Gamification and achievement badges

## Contributing

Contributions are welcome. Please feel free to submit a pull request or open an issue.

## License

This project is private and proprietary. All rights reserved.
