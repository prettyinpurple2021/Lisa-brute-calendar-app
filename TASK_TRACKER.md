# VibeOS — Living Task Tracker

> **How to use this document**
> Move items between sections as work progresses.
> - 📋 **To Do** — not started
> - 🔄 **In Progress** — actively being worked on
> - ✅ **Done** — confirmed complete in code

_Last updated: June 2026_

---

## 📋 To Do

### Settings (Priority 1)
- [ ] Connect profile avatar upload to Supabase storage
- [ ] Persist theme preference to `user_preferences` table
- [ ] Email/password change functionality
- [ ] Account deletion with confirmation dialog
- [ ] Export user data (expand beyond current supported subset)

### AI Chat (Priority 2)
- [ ] Configure Vercel AI Gateway explicitly in app code
- [ ] Build chat message interface (bubbles, timestamps, scroll)
- [ ] Streaming message support
- [ ] Chat history storage in database
- [ ] Context awareness — reference tasks, events, habits in chat

### Files System (Priority 3)
- [ ] File upload UI with drag-and-drop
- [ ] File preview (images, PDFs)
- [ ] Folder/tag organization
- [ ] File sharing functionality (optional)

### Focus Timer (Priority 4)
- [ ] Create `focus_sessions` database table
- [ ] Persist completed focus sessions to `focus_sessions`
- [ ] Session history & stats in Analytics

### Notifications (Priority 4)
- [ ] Build notification sending pipeline/scheduler
- [ ] Daily digest email

### Data & Export (Priority 4)
- [ ] Expand CSV export to all data types (currently: tasks, events, habits, notes, time-sessions)
- [ ] Expand PDF export to all data types

### Database & Infrastructure (Priority 5)
- [ ] Add Supabase migration files to repo
- [ ] Add RLS policy files to repo (so they can be verified in code)

### Polish & Performance (Priority 5)
- [ ] Loading skeletons on all pages
- [ ] Image optimization
- [ ] Code splitting & lazy loading
- [ ] Performance metrics / Lighthouse audit

### Testing (Priority 5)
- [ ] Create account & verify email confirmation works
- [ ] Login with existing account
- [ ] Create event in calendar
- [ ] Edit & delete events
- [ ] Create task with app context
- [ ] Update task status (kanban columns)
- [ ] Log energy level
- [ ] Complete habit
- [ ] Use quick capture (Cmd+K)
- [ ] View analytics & streak data
- [ ] Test all navigation links
- [ ] Mobile responsiveness check
- [ ] Logout & redirect verification

---

## 🔄 In Progress

### Accessibility
- [ ] Full WCAG AA compliance audit (skip link + ARIA labels exist; full compliance not yet verified)

### README / Documentation
- [ ] Flesh out README to cover all features, setup steps, and environment variables fully

---

## ✅ Done

### Authentication & Security
- [x] Email/password signup & login pages
- [x] Supabase Auth integration (server + client)
- [x] GitHub OAuth callback flow
- [x] Protected route behavior (`protected-layout` + API route auth checks)
- [x] Middleware redirects unauthenticated users
- [x] Auto-profile creation trigger on signup
- [x] Real-time session management via Supabase + middleware/proxy

### Dashboard
- [x] Today's date & upcoming events display
- [x] Energy level display with color coding
- [x] Habit streak summary with completion counts
- [x] Quick access to top-priority tasks
- [x] Daily Goals feature

### Calendar
- [x] Full month calendar view
- [x] Event creation via modal
- [x] Event editing (in-place)
- [x] Event deletion with confirmation
- [x] Color-coded events
- [x] Recurrence fields on events
- [x] Meeting prep modal
- [x] Real-time Supabase sync

### Tasks
- [x] Kanban board (Todo → In Progress → Done)
- [x] App context filtering (7 apps)
- [x] Priority badges (Low / Medium / High / Urgent)
- [x] Due date display
- [x] Task CRUD (create, edit, delete)
- [x] Recurring task fields
- [x] Time tracking (`time_sessions` table)
- [x] Real-time database updates

### Notes / Inbox (Quick Captures)
- [x] Cmd+K global capture modal
- [x] Capture types: Thought, Task, Idea, Link
- [x] Mark as processed / archive
- [x] Chronological list view + filter by type
- [x] Real-time sync

### Analytics
- [x] Energy level heatmap (7-day weekly view)
- [x] Habit completion calendar grid
- [x] Weekly statistics & insights
- [x] Habit streak tracking

### Projects
- [x] Project CRUD
- [x] GitHub repository link/unlink
- [x] Project-based filtering across core screens

### Settings
- [x] Profile display (reads from DB)
- [x] User preferences persistence
- [x] Push notification toggle UI
- [x] CSV/PDF export actions (for supported types)

### AI Chat
- [x] `/api/chat` route implemented with AI SDK
- [x] `/api/meeting-prep` route implemented

### Files
- [x] `/api/files/upload` route
- [x] `/api/files/list` route
- [x] `/api/files/download` route
- [x] `/api/files/delete` route
- [x] Files UI page

### Focus Timer
- [x] Timer UI/countdown works

### Integrations
- [x] Supabase
- [x] Vercel Blob
- [x] GitHub repository integration
- [x] Push notification subscription flow + service worker

### Navigation
- [x] Desktop fixed left sidebar (all app links)
- [x] Mobile bottom navigation (first 5 + overflow menu)
- [x] Active state highlighting
- [x] Keyboard shortcuts (Cmd+K, Cmd+1–7)
- [x] Shortcuts modal

### User Experience
- [x] Toast notifications
- [x] Loading states
- [x] Error boundaries (`app/error.tsx`, `app/global-error.tsx`)
- [x] Not found page (`app/not-found.tsx`)
- [x] Responsive / mobile-first layouts
- [x] PWA manifest wired

### Legal & SEO
- [x] Privacy Policy page
- [x] Terms page
- [x] Open Graph metadata
- [x] Twitter metadata
- [x] Meta description + keywords
- [x] OG image asset
- [x] Web manifest
- [x] Landing page: features section
- [x] Landing page: pricing section (display-only)
- [x] Landing page: testimonials section

### Database Tables (confirmed in code)
- [x] `profiles`
- [x] `projects`
- [x] `events`
- [x] `tasks`
- [x] `quick_captures`
- [x] `habits`
- [x] `habit_completions`
- [x] `energy_logs`
- [x] `daily_goals`
- [x] `time_sessions`
- [x] `push_subscriptions`
- [x] `user_preferences`
