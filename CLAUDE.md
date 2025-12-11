# Book Club Website - Project Instructions

## Project Vision

**Goal**: A dedicated website for a specific book club community. The event queue/RSVP system is one component of a larger book club website.

**Target Audience**: Book club members who primarily engage via Instagram, WhatsApp group chat, and in-person meetups.

**Website Sections** (Planned):
1. **Event Queue** (Current) - RSVP and waitlist for book club meetings
2. **About & Members** - Club info, member profiles, mission
3. **Book Archive** - Past reads, reviews, reading lists, recommendations
4. **Blog/Discussion** - Posts, book discussions, member contributions
5. **Media & Gallery** - Event photos, videos, social media integration

**Current State**: Phase 1, Phase 2, and Phase 3 (Visual Redesign) complete. Website has Three.js animated homepage, dark theme throughout, events system with email registration, self-cancellation, and calendar integration.

---

## Completed Features

### Phase 1: Core UX (DONE)
- [x] Self-cancellation via unique link
- [x] Calendar integration (Google Calendar + Apple Calendar .ics download)
- [x] Email-based registration (replaces Instagram as primary)
- [x] Cancel token generation for each registration

### Phase 2: Website Foundation (DONE)
- [x] Landing page with hero, next event, features section
- [x] About page with club story and how-it-works guide
- [x] Header and Footer layout components
- [x] Mobile-responsive navigation
- [x] SEO meta tags and Open Graph support

### Phase 3: Visual Redesign (DONE)
- [x] Three.js animated background with floating books
- [x] Dark theme across all pages
- [x] Custom typography (Cormorant Garamond + Space Grotesk)
- [x] Loading animation ("ENTERING THE VOID")
- [x] RSVP modal with calendar integration
- [x] Scroll/mouse parallax effects
- [x] Particle dust effects and book glow
- [x] Past books section placeholder

### Pending Features
- [ ] Event reminders (24h before event via email)
- [ ] Waitlist notifications (email when spot opens)
- [ ] Book archive (database + UI)
- [ ] Photo gallery
- [ ] Blog/discussions

---

## Tech Stack

- **Framework**: Next.js 14.2.18 (App Router, React Server Components)
- **Language**: TypeScript 5.6.3 (strict mode)
- **Database**: Prisma 5.22.0 with PostgreSQL (Neon) / SQLite (local dev)
- **Validation**: Zod 3.23.8
- **Styling**: Tailwind CSS 3.4.15
- **3D Graphics**: Three.js (dynamic import, client-side only)
- **Fonts**: Google Fonts (Cormorant Garamond, Space Grotesk)
- **Linting**: ESLint with Next.js config

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Landing page (hero, next event, features)
│   ├── about/page.tsx      # About page
│   ├── events/page.tsx     # Event listing
│   ├── event/[id]/page.tsx # Event detail + RSVP form
│   ├── cancel/page.tsx     # Self-cancellation page
│   ├── admin/              # Admin panel (password protected)
│   │   ├── layout.tsx      # Auth guard wrapper
│   │   ├── page.tsx        # Dashboard
│   │   ├── new/            # Create event
│   │   └── event/[id]/     # Event management
│   └── api/
│       ├── admin/verify/   # Password verification
│       ├── events/         # Event CRUD + registrations
│       └── registrations/cancel/ # Self-cancellation API
├── components/
│   ├── layout/             # Header, Footer components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── AdminAuth.tsx       # Auth context & guard
├── lib/
│   ├── db.ts              # Prisma client singleton
│   ├── validations.ts     # Zod schemas
│   ├── utils.ts           # Date formatting, calendar generation, tokens
│   └── constants.ts       # Site name, social links, nav items
└── types/
    └── index.ts           # TypeScript interfaces
```

---

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build (includes prisma generate & db push)
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio GUI
npx tsc --noEmit     # TypeScript compilation check
```

---

## Environment Variables

Required in `.env` (DO NOT commit, add values manually):
```bash
DATABASE_URL="postgresql://..."              # Neon PostgreSQL connection
ADMIN_PASSWORD="..."                         # Admin authentication

# Public variables (exposed to browser)
NEXT_PUBLIC_SITE_URL="https://eatbooksclub.com"   # Site URL for cancel links
NEXT_PUBLIC_INSTAGRAM_URL=""                      # Instagram profile URL
NEXT_PUBLIC_WHATSAPP_URL=""                       # WhatsApp group invite URL
NEXT_PUBLIC_BUYMEACOFFEE_USERNAME=""              # Buy Me a Coffee username

# Optional
INSTAGRAM_WEBHOOK_URL=""                          # Optional notification webhook
```

---

## Development Standards

### Before Committing
1. Run `npx tsc --noEmit` - TypeScript check
2. Run `npm run lint` - Linting check
3. Run `npm run build` - Build verification

### Code Patterns

**Prisma Client**: Always use singleton
```typescript
import { prisma } from '@/lib/db';
```

**Validation**: Zod schemas in `@/lib/validations.ts`
```typescript
import { eventSchema } from '@/lib/validations';
const validated = eventSchema.parse(data);
```

**Client Components**: Mark with directive
```typescript
"use client";
```

**API Auth**: Admin routes require header
```typescript
const password = request.headers.get('x-admin-password');
if (password !== process.env.ADMIN_PASSWORD) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Naming Conventions
- **Files/Routes**: kebab-case
- **Components**: PascalCase
- **Functions/Variables**: camelCase
- **Types/Interfaces**: PascalCase

---

## Business Logic (Event Queue)

### Registration Flow
1. Check event exists and is active
2. Check for duplicate Instagram handle
3. If spots available -> status: "confirmed"
4. If waitlist enabled and has room -> status: "waitlist" with position
5. If full -> reject registration

### Waitlist Promotion
When registration removed:
1. First waitlisted person auto-promoted to "confirmed"
2. Remaining waitlist positions recalculated

---

## Database Schema

**Current Models**:
- **Event**: Book club event with spots, waitlist config
- **Registration**: User registration with confirmed/waitlist status

**Relationships**:
- Event -> Registration (one-to-many, cascade delete)

---

## Development Priority: User Experience

Focus on features that improve the experience for book club members.

### Phase 1: Core UX (Current Priority)

| Feature | Description | Benefit |
|---------|-------------|---------|
| Self-cancellation | Members cancel via unique link | Reduces admin workload, opens spots faster |
| Calendar integration | Add to Google/Apple Calendar | Members don't miss events |
| Event reminders | Notification 24h before | Better attendance |
| Waitlist notifications | Auto-notify when spot opens | Faster waitlist turnover |

### Phase 2: Website Foundation

| Feature | Description | Benefit |
|---------|-------------|---------|
| Landing page | Proper homepage with navigation | Professional presence |
| About page | Club mission, how to join | New member onboarding |
| Navigation/Layout | Consistent header, footer, nav | Site cohesion |
| Responsive design audit | Mobile-first refinement | Most members on mobile |

### Phase 3: Content & Community

| Feature | Description | Benefit |
|---------|-------------|---------|
| Book archive | Past books with covers, summaries | Club history, discovery |
| Member profiles | Optional profiles, reading history | Community building |
| Photo gallery | Event photos integration | Social proof, memories |
| Instagram feed embed | Show club's IG posts | Social connection |

### Phase 4: Engagement

| Feature | Description | Benefit |
|---------|-------------|---------|
| Blog/discussion posts | Member contributions | Engagement between events |
| Book reviews | Member reviews of past reads | Content, recommendations |
| Reading lists | Curated book recommendations | Value for members |
| WhatsApp link | Easy access to group chat | Bridge to existing community |

---

## Technical Debt (Fix Before Major Features)

| Priority | Issue | Location | Fix |
|----------|-------|----------|-----|
| High | Race condition | `api/events/[id]/registrations/route.ts` | Wrap in Prisma transaction |
| Medium | Duplicate formatDate | Multiple pages | Extract to `lib/utils.ts` |
| Medium | Hardcoded strings | UI components | Create `lib/constants.ts` |
| Low | No error boundaries | All pages | Add React error boundaries |

---

## Quick Wins (Do First)

1. **Extract `formatDate()` to utils** - DRY, reusable across new pages
2. **Add constants file** - Status strings, limits as constants
3. **Add meta tags** - SEO for event sharing
4. **Loading skeletons** - Better perceived performance
5. **Favicon** - Brand identity

---

## Database Schema Evolution

As website expands, add these models:

```prisma
// Future additions

model Book {
  id          String   @id @default(cuid())
  title       String
  author      String
  coverUrl    String?
  summary     String?
  discussedAt DateTime?
  rating      Float?
  createdAt   DateTime @default(now())
  reviews     Review[]
  events      Event[]  // Link books to events
}

model Review {
  id        String   @id @default(cuid())
  bookId    String
  memberName String
  content   String
  rating    Int      // 1-5
  createdAt DateTime @default(now())
  book      Book     @relation(fields: [bookId], references: [id])
}

model BlogPost {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  authorName  String
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model GalleryImage {
  id        String   @id @default(cuid())
  url       String
  caption   String?
  eventId   String?
  createdAt DateTime @default(now())
  event     Event?   @relation(fields: [eventId], references: [id])
}
```

---

## Communication Channels

Members interact via:
- **Instagram** - Primary social, DMs for confirmations
- **WhatsApp** - Group chat for discussions
- **In-person** - At book club events

Website should complement, not replace, these channels.

---

## Deployment

- **Platform**: Vercel
- **Database**: Neon PostgreSQL
- **Build**: `prisma generate && prisma db push && next build`
- **Env vars**: Set in Vercel dashboard

---

## Session Context

When starting work, check:
1. Current branch and git status
2. Any pending changes in schema.prisma
3. Which phase/feature is being worked on
4. Run `npm run dev` to verify app works

When ending work:
1. Run `npx tsc --noEmit` and `npm run lint`
2. Commit with descriptive message
3. Note any incomplete work for next session
