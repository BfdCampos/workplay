# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
wrkplay is a gamification platform for office games (ping pong, pool, etc.) that tracks performance, maintains leaderboards, and awards medals. It integrates with Slack for authentication and match notifications.

## Development Commands

### Initial Setup
```bash
docker compose up -d       # Start PostgreSQL database
yarn setup:env            # Copy .env.template to .env
yarn                      # Install dependencies (uses pnpm)
yarn setup:db             # Run migrations and seed database with 100 users
```

### Daily Development
```bash
yarn dev                  # Start development server on localhost:3000
yarn test                 # Run unit tests
yarn test:watch          # Run tests in watch mode
yarn e2e                 # Run Cypress E2E tests
yarn ts-check            # Check TypeScript types
```

### Database Operations
```bash
yarn db:migrate:local --name <migration_name>  # Create new migration
yarn db:generate                                # Regenerate Prisma client after schema changes
yarn db:migrate:forcepush                      # Force push schema (destructive)
```

### Build & Deploy
```bash
yarn build               # Build for production
yarn start               # Start production server
yarn analyse             # Analyze bundle size
```

## Architecture

### Tech Stack
- **Framework**: Next.js 12 with Pages Router (not App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js with Google OAuth (primary), Slack OAuth (optional), dev mode available
- **UI**: Chakra UI v2 + Emotion CSS-in-JS
- **State**: React Query (Tanstack Query) + Jotai
- **Testing**: Jest + React Testing Library + Cypress

### Key Directories
- `/src/pages/api/` - API endpoints (Next.js API routes)
- `/src/components/shared/` - Reusable UI components
- `/src/components/admin/` - Admin-only components
- `/src/lib/` - Utilities, API handlers, and business logic
- `/prisma/` - Database schema and migrations

### Important Patterns
1. **API Routes**: All backend logic in `/pages/api/`, handlers in `/lib/api/handlers/`
2. **Database Access**: Always use Prisma client from `/lib/prisma.ts`
3. **Authentication**: Check roles with `hasRole()` from `/lib/roles.ts`
4. **Type Safety**: TypeScript strict mode enabled, use type imports
5. **Component Imports**: Use path alias `@/` for src directory

### Environment Variables
Key variables in `.env`:
- `NEXTAUTH_URL`: Auth callback URL
- `NEXTAUTH_SECRET`: Required for NextAuth session encryption
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (primary auth method)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `SLACK_CLIENT_ID`: Slack OAuth (optional, for backward compatibility)
- `SLACK_CLIENT_SECRET`: Slack OAuth (optional)
- `SLACK_BOT_TOKEN`: For Slack notifications
- `NEXT_PUBLIC_ENABLE_DEV_LOGIN`: Enable dev login button
- `ENABLE_SLACK_MATCH_NOTIFICATION`: Toggle match notifications
- `ENABLE_PLAYER_BADGES`: Toggle medal/badge features

### Database Schema
Main models in Prisma:
- `User`: Players with Google/Slack/GitHub authentication
- `Office`: Physical office locations
- `Game`: Game types (pool, ping pong, etc.)
- `Match`: Game results with PlayerScores
- `Season`: Time-bounded competition periods
- `Medal`: Achievements awarded to players

### Testing Approach
- Unit tests for utilities and hooks
- Integration tests for API endpoints
- E2E tests for critical user flows
- Run single test: `yarn test path/to/file.spec.ts`

### Authentication Notes (Updated)
- **Primary Auth**: Google OAuth is now the default authentication method
- **Custom Sign-in Page**: `/auth/signin` with Google sign-in prominently displayed
- **Account Selection**: Google auth configured to always show account picker
- **Backward Compatibility**: Slack OAuth still supported but no longer primary
- **Dev Mode**: Dev login available via header menu, with "Normal sign in" option
- **Image Domains**: Google profile images from `lh3.googleusercontent.com` are allowed
- **User Creation**: Same role structure maintained for all auth providers
- **Slack Features**: Notifications only sent for Slack-authenticated users