# Greenlight

## Spec

Read SPEC.md for full requirements.

## Project Status

**Current Phase:** Ready to Run

## Quick Start

```bash
# Use --webpack flag (Turbopack has font issues in Next.js 16)
npx next dev --webpack
# Open http://localhost:3000
```

## Completed

### Database (Supabase)

- **Tables:** `users`, `requirements`, `sign_offs` (all with RLS)
- **Trigger:** `recalculate_requirement_status()` - auto-updates status based on sign-offs
- **Storage:** `requirements` bucket (private)
- **Realtime:** Enabled for live sign-off updates

### Frontend (Next.js 16 + tRPC v11)

```
src/
├── app/
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts    # tRPC handler
│   │   ├── brd-generator/route.ts  # Claude API for BRD generation
│   │   └── parse-document/route.ts # Document parsing endpoint (PDF, DOCX, TXT, MD)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx       # Role selection (locked after registration)
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Protected layout with nav
│   │   └── requirements/
│   │       ├── page.tsx            # List view with status filters
│   │       ├── new/page.tsx        # Upload form (BUSINESS only)
│   │       ├── generate/page.tsx   # AI BRD Generator
│   │       └── [id]/page.tsx       # Detail + SignOffPanel
│   ├── globals.css
│   ├── layout.tsx                  # TRPCProvider + Toaster
│   └── page.tsx                    # Redirects based on auth
├── components/
│   ├── providers/TRPCProvider.tsx
│   ├── ui/                         # Badge, Button, Input, Avatar
│   ├── sign-offs/                  # SignOffPanel, SignOffButton, SignOffList
│   ├── brd-generator/              # BRDGenerator, BRDDocumentPreview, ContextDocumentUpload
│   └── requirements/               # RequirementCard, RequirementList, UploadForm, DownloadButton
├── hooks/
│   ├── useSession.ts
│   ├── useSignOffs.ts              # Real-time subscription + toast notifications
│   ├── useBRDGenerator.ts          # BRD chat state management
│   └── useContextDocument.ts       # Context document upload state
├── server/
│   ├── trpc.ts                     # Context + middleware (public, protected, business)
│   └── routers/                    # auth, requirements, signoffs, schema
├── lib/
│   ├── supabase-browser.ts         # Client-side Supabase (for 'use client' components)
│   ├── supabase-server.ts          # Server-side Supabase (for Server Components, tRPC)
│   ├── trpc.ts                     # Client hooks
│   ├── documentParser.ts           # PDF/DOCX/TXT/MD parsing (uses pdfjs-dist, mammoth)
│   └── utils.ts                    # cn(), formatDate(), formatRelativeTime()
└── types/index.ts                  # Role, Status, User, Requirement, SignOff
```

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://aywckgeqxycrxrtmghbe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<configured in .env.local>
ANTHROPIC_API_KEY=<configured in .env.local>
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict)
- tRPC v11
- Supabase (database, auth, storage, realtime)
- Tailwind CSS v4
- Zod, Sonner
- Claude API (Anthropic SDK) - BRD generation
- pdfjs-dist, mammoth - Document parsing

## Key Features

1. **Role-based access:** BUSINESS uploads, all roles sign off
2. **Auto-status:** DRAFT → IN_REVIEW → APPROVED (via DB trigger)
3. **Real-time:** Sign-offs appear instantly with toast notifications
4. **Locked after approval:** No changes once APPROVED/REJECTED
5. **Audit trail:** Sign-offs are permanent, cannot be deleted
6. **AI BRD Generator:** Conversational interface to create BRDs with Claude
7. **Context Document Upload:** Attach reference docs (PDF, DOCX, TXT, MD) to provide context for BRD generation

## BRD Generator

The AI-powered BRD Generator guides users through creating comprehensive Business Requirements Documents.

**Flow:**
1. Navigate to `/requirements/generate`
2. Optionally attach a reference document (business design doc, scoping doc, etc.)
3. Click "Start New BRD" - Claude begins asking questions
4. Answer conversationally - Claude gathers info across 9 phases
5. When complete, Claude outputs a formatted BRD with `DOCUMENT_READY` marker
6. Review in split-view preview, then submit for approval

**Context Document Upload:**
- Supports PDF, DOCX, TXT, MD (max 10MB)
- Parsed server-side using pdfjs-dist (PDF) and mammoth (DOCX)
- Content truncated to ~50k chars for token safety
- Injected into Claude's system prompt as reference context

## Test Flow

1. Register 3 users with different roles (BUSINESS, PRODUCT, TECH)
2. Login as BUSINESS → Upload a requirement
3. Login as each role → Sign off
4. Watch status auto-update to APPROVED when all 3 sign

## Deployment (Vercel)

```bash
npx vercel
```

Required environment variables in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Known Issues

- **Turbopack + Google Fonts:** Use `--webpack` flag for dev, or use system fonts (currently using system fonts)
- **Supabase email rate limit:** Disable "Confirm email" in Supabase Dashboard for development

## Recent Changes

- **Epic Link Editor (2026-02-09):** Added optimistic UI update so the displayed epic link updates immediately after save without requiring page refresh

## Future Features

- **Figma support for context documents:** Add ability to use Figma designs as context in BRD Generator (options to explore: URL-based via Figma API, exported PDFs, or screenshot uploads)
