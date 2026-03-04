# EMR-Jotform-Wrapper

Web app that wraps JotForm to support dynamic image-picker questions for the Event-Based Memory Test (Round II), administered across 5 districts in Hong Kong.

## Project Purpose

JotForm lacks native support for per-class dynamic image sets. This wrapper intercepts the interview workflow, looks up the correct image set for each class, and submits responses back to JotForm via API.

## District Coverage

| District | Session sets |
|---|---|
| Kowloon City | 6 |
| Sham Shui Po | 6 |
| Shatin | 6 |
| Tuen Mun | **8** |
| Yuen Long | 6 |

## ID Formats

| Field | Format | Example |
|---|---|---|
| Student ID | `St1xxxx` | `St10001`, `St12345` |
| School ID | `Sxxx` (zero-padded) | `S001`, `S120` |
| Class ID | `C-xxx-yy` (xxx = 3-digit school number, yy = class index) | `C-001-01`, `C-120-03` |
| Session ID | `{district_prefix}-{nn}` (zero-padded, no S) | `KC-01`, `TM-08` |

District prefixes: `KC`, `SSP`, `ST`, `TM`, `YL`

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React 18 + Tailwind CSS v3 |
| Deployment | GitHub Pages (static) |
| Primary storage | JotForm REST API |
| Backup storage | Supabase (JSON blob now → structured columns later) |
| Font | Noto Sans TC (Google Fonts) |

Next.js was considered but rejected — GitHub Pages only serves static files.

## Environment Variables

Prefix all with `VITE_` for Vite. Set as GitHub Secrets for CI/CD. See `.env.example`.

| Variable | Description |
|---|---|
| `VITE_JOTFORM_BASE_URL` | `https://api.jotform.com` |
| `VITE_JOTFORM_FORM_ID` | Numeric form ID |
| `VITE_JOTFORM_API_KEY` | JotForm API key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Colour Scheme (strict)

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#2b3990` | Headers, section titles, primary buttons |
| `orange` | `#f99d33` | CTAs, active states, selected images |
| `pink` | `#f04e69` | Negative emoji, errors |
| `green` | `#8dbe50` | Positive emoji, success |
| `yellow` | `#f4d036` | Neutral emoji, accent |

## JotForm Form

- **Form ID:** `260617738275465`
- **Owner:** `keystepseduhk`
- **Title:** Clone of Kowloon City Hub – Event-based Memory Test Recording Form (Round I)
- **Status:** ENABLED (to be replaced with Round II form)
- **Full schema:** `docs/jotform-schema.json`
- **API reference:** `docs/jotform-api.md`
- **Note:** qid mappings in `src/constants/questions.js` are marked `TODO` — update once the new Round II JotForm is published

## Data Model

```
StudentID → config/students_raw.csv ["Class ID 25/26"] → ClassID
ClassID   → config/classes.csv → SessionID + Q1a…Q8h image filenames
```

- Each class has up to **8 image question blocks** (Q1–Q8)
- Each block has **8 image slots**: `a–d` = scene images (correct = `a`), `e–h` = staff images (correct = `e`)
- Display order is **shuffled client-side**; correct answer identity is kept in memory only
- Non-Tuen Mun districts use Q1–Q6 only; Q7 and Q8 columns are left blank

## Config Files

### `config/students_raw.csv`
Source of truth for student–class mapping. 5,549 rows, 59 columns (cleaned: `_EY`, `_External`, `23/24`, `24/25` columns removed).

Key columns used by the app:
- `Student ID` — lookup key
- `Class ID 25/26` — current-year class assignment
- `Full Name`, `School ID`, `School Name`, `District Cleaned` — auto-fill in form

### `config/classes.csv`
One row per class. 68 columns total:
`ClassID`, `SchoolID`, `District`, `SessionID`, `Q1a`…`Q1h`, `Q2a`…`Q2h`, … `Q8a`…`Q8h`

Image filenames: `{SessionID}_Q{n}{choice}.jpg` e.g. `KC-01_Q1a.jpg`
- `a–d` = scene images (class-specific, correct = `a`)
- `e–h` = staff images (same content across classes per session, correct = `e`)

## Image Assets

All images in a **single flat folder**: `assets/images/`

### Naming convention
```
{SessionID}_Q{n}{choice}.jpg
e.g. KC-01_Q1a.jpg  ← correct scene image for block 1, session KC-01
     KC-01_Q1e.jpg  ← correct staff image for block 1, session KC-01
     TM-08_Q8h.jpg  ← distractor staff image for block 8, session TM-08
```

### Total expected image files
- 4 non-TM districts × 6 sessions × 6 blocks × 8 images = 1,152
- Tuen Mun × 8 sessions × 8 blocks × 8 images = 512
- **Total: 1,664 files**

### Dynamic loading flow
1. Interviewer enters Student ID
2. App looks up `students_raw.csv` → `Class ID 25/26` → `ClassID`
3. App looks up `classes.csv` by `ClassID` → `SessionID` + all image filenames
4. App renders image-picker UI, loads images from `assets/images/`
5. b/c/d and f/g/h display order shuffled client-side
6. On submit → POST to JotForm API + POST to Supabase (backup)

## App Structure

```
src/
  App.jsx                    ← 6-section multi-step form
  components/
    StudentLookup.jsx         ← Student ID input + lookup
    AdminFields.jsx           ← Interviewer, date, phase, auto-filled student info
    EmojiRating.jsx           ← 5-point emoji scale (😭→😃)
    FollowUpCheckbox.jsx      ← Follow-up prompt checkboxes
    ObservationBox.jsx        ← Free-text observation textarea
    ImagePicker.jsx           ← 2×2 shuffled image grid
    ImageBlock.jsx            ← One block: scene picker + staff picker + follow-up
    ProgressBar.jsx           ← Section progress indicator
  hooks/
    useStudentLookup.js       ← Fetch + parse students_raw.csv, lookup by Student ID
    useClassConfig.js         ← Fetch + parse classes.csv, build image block array
  lib/
    csvParser.js              ← Lightweight CSV parser (no external dep)
    jotform.js                ← POST to JotForm API
    supabase.js               ← Supabase backup (JSON blob)
  constants/
    questions.js              ← Question text (Cantonese), qid mappings (TODO: update)
```

## Supabase Table Schema

```sql
create table responses (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  student_id text,
  class_id   text,
  session_id text,
  jotform_id text,     -- JotForm submission ID (null if JotForm failed)
  payload    jsonb not null  -- full form state
);
-- TODO: migrate to structured columns once form schema is finalised
```

## JotForm API Key Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/form/{formId}` | Verify form |
| `GET` | `/form/{formId}/questions` | Get qid mapping |
| `GET` | `/form/{formId}/submissions` | List submissions |
| `POST` | `/form/{formId}/submissions` | Create submission |
| `POST` | `/submission/{submissionId}` | Update submission |
| `DELETE` | `/submission/{submissionId}` | Delete submission |

Authentication: `apiKey` query param or `APIKEY` HTTP header.

## Deployment

- Push to `main` → GitHub Actions builds and deploys to GitHub Pages
- Secrets required: all 5 `VITE_*` env vars set in repo Settings → Secrets
- `vite.config.js` base path: `/EMR-Jotform-Wrapper/` (update if repo name differs)

## Pending Items

- [ ] Publish new Round II JotForm form → update qids in `src/constants/questions.js`
- [ ] Populate `config/classes.csv` with real class-to-session mappings
- [ ] Add all image files to `assets/images/`
- [ ] Create Supabase `responses` table (SQL above)
- [ ] Set GitHub Secrets for all env vars
