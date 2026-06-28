# IPTV Stream Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins attach an M3U/HLS stream URL to any match and publish/unpublish it; when published and the match is live, users see a "Watch Live" button that opens an inline HLS player modal.

**Architecture:** Two new nullable columns (`streamUrl`, `streamPublished`) are added to the matches table via a TypeORM migration and served in the existing `GET /tournaments/:id/matches` response with no new endpoints. Admin manages the stream via a new `PATCH /matches/:id/stream` endpoint. The frontend adds a `StreamPlayer` modal component (hls.js + native `<video>`) and a "Watch Live" button on MatchCard for live matches with a published stream.

**Tech Stack:** NestJS 10 + TypeORM 0.3 + PostgreSQL 16 backend; React 18 + Vite + TanStack Query v5 frontend; `hls.js` v1.x for HLS playback.

## Global Constraints

- TypeORM `synchronize: false`, `migrationsRun: true` — all schema changes go through a migration file in `backend/migrations/`
- Migration timestamp: `1782691200000` (use this exact prefix)
- All admin endpoints must use `@Roles(UserRole.ADMIN)` decorator
- `streamUrl` must be validated as a URL string (use `@IsUrl()` with `require_protocol: true`)
- `streamPublished` defaults to `false` — publishing a stream without a URL must be rejected (400)
- The "Watch Live" button is shown ONLY when `match.status === 'live'` AND `match.streamPublished === true` AND `match.streamUrl` is non-null
- hls.js package name: `hls.js` (install as prod dep, not dev)
- TypeScript must compile clean after every task: `cd frontend && npx tsc --noEmit`
- Design tokens (no hardcoded colours): `var(--bg-0)`, `var(--bg-1)`, `var(--bg-2)`, `var(--line)`, `var(--text)`, `var(--text-mute)`, `var(--accent)`, `var(--live)`, `var(--r)`, `var(--r-sm)`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/migrations/1782691200000-AddStreamToMatch.ts` | Create | Add `streamUrl` (nullable varchar) + `streamPublished` (boolean, default false) to matches |
| `backend/src/matches/entities/match.entity.ts` | Modify | Add `streamUrl` and `streamPublished` TypeORM columns |
| `backend/src/matches/dto/update-stream.dto.ts` | Create | DTO for `PATCH /matches/:id/stream` |
| `backend/src/matches/matches.service.ts` | Modify | Add `updateStream(id, dto)` method |
| `backend/src/matches/matches.controller.ts` | Modify | Add `PATCH /matches/:id/stream` admin endpoint |
| `frontend/src/types/index.ts` | Modify | Add `streamUrl?: string \| null`, `streamPublished?: boolean` to Match interface |
| `frontend/src/api/matches.ts` | Modify | Add `adminUpdateStream(matchId, url, published)` |
| `frontend/src/components/match/StreamPlayer.tsx` | Create | HLS `<video>` component using hls.js with Safari fallback |
| `frontend/src/components/admin/MatchesTab.tsx` | Modify | Per-match stream URL input + Publish/Unpublish button (expanded row) |
| `frontend/src/components/match/MatchCard.tsx` | Modify | "Watch Live" button + StreamPlayer modal for live published matches |

---

## Task 1: Backend — migration + entity + endpoint

**Files:**
- Create: `backend/migrations/1782691200000-AddStreamToMatch.ts`
- Modify: `backend/src/matches/entities/match.entity.ts`
- Create: `backend/src/matches/dto/update-stream.dto.ts`
- Modify: `backend/src/matches/matches.service.ts`
- Modify: `backend/src/matches/matches.controller.ts`

**Interfaces:**
- Produces: `PATCH /matches/:id/stream` — body `{ url?: string | null, published: boolean }` → returns updated `Match`
- Produces: `Match` entity now includes `streamUrl: string | null` and `streamPublished: boolean`
- Produces: `matchesService.updateStream(id: string, dto: UpdateStreamDto): Promise<Match>`

---

- [ ] **Step 1: Create the migration**

Create `backend/migrations/1782691200000-AddStreamToMatch.ts`:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreamToMatch1782691200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "matches"
        ADD COLUMN IF NOT EXISTS "streamUrl" varchar NULL,
        ADD COLUMN IF NOT EXISTS "streamPublished" boolean NOT NULL DEFAULT false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "matches"
        DROP COLUMN IF EXISTS "streamPublished",
        DROP COLUMN IF EXISTS "streamUrl"
    `);
  }
}
```

- [ ] **Step 2: Add columns to the Match entity**

In `backend/src/matches/entities/match.entity.ts`, after the `externalId` column, add:

```typescript
  @Column({ nullable: true, type: 'varchar' })
  streamUrl: string | null;

  @Column({ default: false })
  streamPublished: boolean;
```

Full updated entity bottom section (lines 65–end), for reference:

```typescript
  @Column({ nullable: true, type: 'int' })
  externalId: number | null;

  @Column({ nullable: true, type: 'varchar' })
  streamUrl: string | null;

  @Column({ default: false })
  streamPublished: boolean;
}
```

- [ ] **Step 3: Create the DTO**

Create `backend/src/matches/dto/update-stream.dto.ts`:

```typescript
import { IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStreamDto {
  @ApiPropertyOptional()
  @IsUrl({ require_protocol: true })
  @IsOptional()
  url?: string | null;

  @ApiProperty()
  @IsBoolean()
  published: boolean;
}
```

- [ ] **Step 4: Add `updateStream` to the service**

In `backend/src/matches/matches.service.ts`, add this import at the top:

```typescript
import { UpdateStreamDto } from './dto/update-stream.dto';
```

Then add the method after `publishResult`:

```typescript
  async updateStream(id: string, dto: UpdateStreamDto): Promise<Match> {
    const match = await this.findById(id);
    if (dto.published && !dto.url && !match.streamUrl) {
      throw new BadRequestException('Cannot publish a stream without a URL');
    }
    if (dto.url !== undefined) match.streamUrl = dto.url ?? null;
    match.streamPublished = dto.published;
    return this.matchRepo.save(match);
  }
```

- [ ] **Step 5: Add the endpoint to the controller**

In `backend/src/matches/matches.controller.ts`, add the import:

```typescript
import { UpdateStreamDto } from './dto/update-stream.dto';
```

Then add this route after the `updateStatus` route:

```typescript
  @Patch('matches/:id/stream')
  @Roles(UserRole.ADMIN)
  updateStream(@Param('id') id: string, @Body() dto: UpdateStreamDto) {
    return this.matchesService.updateStream(id, dto);
  }
```

- [ ] **Step 6: Verify TypeScript builds**

```bash
cd /path/to/MySCORE/backend && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 7: Commit**

```bash
git add backend/migrations/1782691200000-AddStreamToMatch.ts \
        backend/src/matches/entities/match.entity.ts \
        backend/src/matches/dto/update-stream.dto.ts \
        backend/src/matches/matches.service.ts \
        backend/src/matches/matches.controller.ts
git commit -m "feat: add streamUrl/streamPublished to matches + PATCH /matches/:id/stream"
```

---

## Task 2: Frontend types + API + StreamPlayer component

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/api/matches.ts`
- Create: `frontend/src/components/match/StreamPlayer.tsx`

**Interfaces:**
- Consumes: `Match` from `frontend/src/types/index.ts` (Task 1 produced `streamUrl`/`streamPublished` on the backend)
- Produces: `Match` interface has `streamUrl?: string | null` and `streamPublished?: boolean`
- Produces: `matchesApi.adminUpdateStream(matchId: string, url: string | null, published: boolean): Promise<Match>`
- Produces: `StreamPlayer({ url: string; onClose: () => void }): JSX.Element` — full-screen modal HLS player

---

- [ ] **Step 1: Add fields to the Match type**

In `frontend/src/types/index.ts`, find the `Match` interface and add after `awayScore?`:

```typescript
  streamUrl?: string | null;
  streamPublished?: boolean;
```

Full Match interface after change:

```typescript
export interface Match {
  id: string;
  tournamentId: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffAt: string;
  stage: MatchStage;
  groupLabel?: string;
  venue?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  streamUrl?: string | null;
  streamPublished?: boolean;
}
```

- [ ] **Step 2: Add `adminUpdateStream` to the matches API**

In `frontend/src/api/matches.ts`, add this method inside the `matchesApi` object, after `importMatches`:

```typescript
  adminUpdateStream: async (
    matchId: string,
    url: string | null,
    published: boolean,
  ): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/matches/${matchId}/stream`, {
      url: url || undefined,
      published,
    });
    return res.data;
  },
```

- [ ] **Step 3: Install hls.js**

```bash
cd /path/to/MySCORE/frontend && npm install hls.js
```

Verify it appears in `frontend/package.json` under `dependencies` (not devDependencies).

- [ ] **Step 4: Create StreamPlayer component**

Create `frontend/src/components/match/StreamPlayer.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Props {
  url: string;
  onClose: () => void;
}

export function StreamPlayer({ url, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = url;
      video.addEventListener('loadedmetadata', () => { video.play().catch(() => {}); });
    }
  }, [url]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 960 }}>
        <button
          onClick={onClose}
          aria-label="Close player"
          style={{
            position: 'absolute', top: -36, right: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)', fontSize: 14, fontWeight: 600, padding: '4px 8px',
          }}
        >
          ✕ Close
        </button>
        <video
          ref={videoRef}
          controls
          style={{
            width: '100%',
            borderRadius: 'var(--r)',
            background: '#000',
            maxHeight: '80vh',
          }}
        />
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-mute)', marginTop: 8 }}>
          If the stream doesn't load, your network may block this source.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /path/to/MySCORE/frontend && npx tsc --noEmit
```

Expected: no output (clean). If hls.js types are missing, run `npm install --save-dev @types/hls.js` — but hls.js v1+ ships its own types so this shouldn't be needed.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types/index.ts \
        frontend/src/api/matches.ts \
        frontend/src/components/match/StreamPlayer.tsx \
        frontend/package.json \
        frontend/package-lock.json
git commit -m "feat: add stream types, API method, and StreamPlayer HLS modal"
```

---

## Task 3: Admin stream management UI (MatchesTab)

**Files:**
- Modify: `frontend/src/components/admin/MatchesTab.tsx`

**Interfaces:**
- Consumes: `matchesApi.adminUpdateStream(matchId, url, published)` from Task 2
- Consumes: `Match.streamUrl`, `Match.streamPublished` from Task 2
- Produces: Per-match expandable stream row with URL input + Publish/Unpublish button

**Design:** The stream management row appears as an expandable second row in the matches table (same pattern as the existing `resultMatchId` expansion). A new `streamMatchId` state tracks which match has its stream row open. The row contains a text input for the M3U URL and a Publish/Unpublish toggle button.

---

- [ ] **Step 1: Add stream state and mutation to MatchesTab**

In `frontend/src/components/admin/MatchesTab.tsx`, add after the existing `const [resultMatchId, setResultMatchId] = useState<string | null>(null);`:

```typescript
  const [streamMatchId, setStreamMatchId] = useState<string | null>(null);
  const [streamUrlDraft, setStreamUrlDraft] = useState<Record<string, string>>({});
```

Then add the stream mutation after the `createMutation` block:

```typescript
  const streamMutation = useMutation({
    mutationFn: ({ id, url, published }: { id: string; url: string | null; published: boolean }) =>
      matchesApi.adminUpdateStream(id, url, published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast('Stream updated', 'success');
    },
    onError: () => toast('Failed to update stream', 'error'),
  });
```

- [ ] **Step 2: Add Stream column header**

In the `<thead>` section, find:

```tsx
{['Date/Time','Home','Away','Stage','Status','Result','Actions'].map(h => (
  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
))}
```

Change to:

```tsx
{['Date/Time','Home','Away','Stage','Status','Result','Stream','Actions'].map(h => (
  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
))}
```

- [ ] **Step 3: Add Stream cell and expansion row**

In `frontend/src/components/admin/MatchesTab.tsx`, in the `matches.map(match => (...))` block, find the `<td>` containing the Actions buttons. Add a new `<td>` for the Stream column BEFORE the Actions `<td>`:

```tsx
<td style={{ padding: '10px 12px' }}>
  <button
    onClick={() => {
      setStreamMatchId(streamMatchId === match.id ? null : match.id);
      setStreamUrlDraft(d => ({ ...d, [match.id]: match.streamUrl ?? '' }));
    }}
    style={{
      padding: '4px 10px', fontSize: 12, fontWeight: 600,
      borderRadius: 'var(--r-sm)', cursor: 'pointer', border: 'none',
      background: match.streamPublished
        ? 'rgba(25,224,138,0.15)'
        : 'rgba(255,255,255,0.07)',
      color: match.streamPublished ? 'var(--live)' : 'var(--text-mute)',
    }}
  >
    {match.streamPublished ? '📡 Live' : '📡 Stream'}
  </button>
</td>
```

Also update the `colSpan` values: the result expansion row currently has `colSpan={7}` — change it to `colSpan={8}`. Add a new expansion row for the stream after the result expansion row:

```tsx
{streamMatchId === match.id && (
  <tr key={`s-${match.id}`}>
    <td colSpan={8} style={{ padding: '12px 20px', background: 'var(--bg-1)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: 'var(--text-mute)' }}>M3U / HLS Stream URL</label>
          <Input
            type="url"
            placeholder="https://example.com/stream.m3u8"
            value={streamUrlDraft[match.id] ?? match.streamUrl ?? ''}
            onChange={e => setStreamUrlDraft(d => ({ ...d, [match.id]: e.target.value }))}
          />
        </div>
        <Button
          variant="primary"
          disabled={streamMutation.isPending}
          onClick={() => streamMutation.mutate({
            id: match.id,
            url: streamUrlDraft[match.id] || null,
            published: true,
          })}
        >
          {streamMutation.isPending ? '…' : 'Publish'}
        </Button>
        {match.streamPublished && (
          <Button
            variant="ghost"
            disabled={streamMutation.isPending}
            onClick={() => streamMutation.mutate({
              id: match.id,
              url: match.streamUrl ?? null,
              published: false,
            })}
          >
            Unpublish
          </Button>
        )}
        <Button variant="ghost" onClick={() => setStreamMatchId(null)}>Cancel</Button>
      </div>
      {match.streamPublished && match.streamUrl && (
        <p style={{ fontSize: 11, color: 'var(--live)', marginTop: 8 }}>
          ✓ Stream is published: {match.streamUrl}
        </p>
      )}
    </td>
  </tr>
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /path/to/MySCORE/frontend && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/admin/MatchesTab.tsx
git commit -m "feat: add stream management UI to admin MatchesTab"
```

---

## Task 4: Watch Live button on MatchCard

**Files:**
- Modify: `frontend/src/components/match/MatchCard.tsx`

**Interfaces:**
- Consumes: `StreamPlayer({ url: string, onClose: () => void })` from Task 2
- Consumes: `match.streamUrl`, `match.streamPublished` from Task 2

**Design:** When `match.status === 'live'` AND `match.streamPublished === true` AND `match.streamUrl` is non-null, render a "🔴 Watch Live" button in the card's header row (right of the StatusPill). Clicking it opens the StreamPlayer in a modal (rendered via a React portal into `document.body`). State `showStream` lives locally in MatchCard.

---

- [ ] **Step 1: Import StreamPlayer and add state**

In `frontend/src/components/match/MatchCard.tsx`, add the import at the top:

```typescript
import { useState } from 'react';
import { StreamPlayer } from './StreamPlayer';
```

Inside the `MatchCard` function, after the existing `const showCountdown = ...` line, add:

```typescript
  const [showStream, setShowStream] = useState(false);
  const hasLiveStream = match.status === 'live' && match.streamPublished === true && !!match.streamUrl;
```

- [ ] **Step 2: Add Watch Live button and StreamPlayer**

In the header row div (`/* Header row */`), after `<StatusPill status={match.status} />`, add:

```tsx
{hasLiveStream && (
  <button
    onClick={() => setShowStream(true)}
    style={{
      marginLeft: 8,
      padding: '4px 12px',
      fontSize: 12, fontWeight: 700,
      background: 'rgba(25,224,138,0.15)',
      color: 'var(--live)',
      border: '1px solid var(--live)',
      borderRadius: 20,
      cursor: 'pointer',
      letterSpacing: '.02em',
    }}
  >
    🔴 Watch Live
  </button>
)}
```

At the very end of the returned JSX, before the closing `</Card>` tag, add:

```tsx
{showStream && match.streamUrl && (
  <StreamPlayer url={match.streamUrl} onClose={() => setShowStream(false)} />
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /path/to/MySCORE/frontend && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/match/MatchCard.tsx
git commit -m "feat: add Watch Live button to MatchCard for published live streams"
```

---

## Self-Review

**Spec coverage:**
- ✅ Admin can attach M3U URL to a match — Task 3 (MatchesTab stream row with URL input)
- ✅ Admin Publish/Unpublish button — Task 3 (Publish button sets `published: true`, Unpublish sets `published: false`)
- ✅ Publish rejected if no URL — Task 1 (service throws 400 if `published && !url && !match.streamUrl`)
- ✅ "Watch Live" button only on live + published — Task 4 (`hasLiveStream` gate)
- ✅ Inline HLS player in browser — Task 2 (StreamPlayer with hls.js)
- ✅ hls.js for non-Safari, native video for Safari — Task 2 (`Hls.isSupported()` branch)
- ✅ DB migration with correct timestamp `1782691200000` — Task 1
- ✅ `@Roles(UserRole.ADMIN)` on stream endpoint — Task 1
- ✅ TypeScript compiles clean after each task
- ✅ Design tokens only (no hardcoded colours)
- ✅ Stream fields included in existing GET matches response (no new endpoint needed — TypeORM serialises the new columns automatically)

**Type consistency check:**
- `adminUpdateStream(matchId: string, url: string | null, published: boolean)` in api/matches.ts — matches body `{ url, published }` sent to `PATCH /matches/:id/stream` ✅
- `UpdateStreamDto.url?: string | null` + `UpdateStreamDto.published: boolean` — matches service method signature ✅
- `StreamPlayer({ url: string, onClose: () => void })` — consumed in MatchCard with `match.streamUrl` (non-null guarded by `hasLiveStream`) ✅
- `Match.streamUrl?: string | null` — `|| null` in `adminUpdateStream` converts empty string to null ✅
