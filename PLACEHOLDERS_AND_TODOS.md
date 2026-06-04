# VibeOS - Placeholders & TODOs Tracking

This document tracks every placeholder, mock, and incomplete implementation that needs to be replaced with real functionality.

**Last Updated:** GitHub Integration Complete

---

## Features with Real Backend (COMPLETE)

### Dashboard
- Daily planning view with real database queries
- Daily Goals CRUD (create, complete, delete goals)
- Energy level tracker (real data)
- Habit streaks (real data from habit_completions)
- Today's schedule (real events from DB)
- Project filtering on all data

### Calendar
- Full CRUD operations on events
- Real Supabase backend
- Event creation/editing/deletion
- AI Meeting Prep feature (generates talking points)
- Project filtering support
- Toast notifications for all actions

### Tasks
- Task creation with app context filtering
- Status/priority management
- Real database storage
- Project filtering support
- Toast notifications for all actions

### Notes/Inbox
- Quick capture functionality
- Real quick_captures table
- Process/archive captures
- Convert captures to tasks
- Project filtering support
- Toast notifications for all actions

### Analytics/Habits
- Energy heatmap (real data)
- Habit completion tracking (real data)
- Weekly insights (real calculations)
- Full habit CRUD (create, edit, delete habits)
- Icon and color selection for habits
- Project association for habits
- Toast notifications for all actions

### Authentication
- Supabase email/password auth
- Protected routes via middleware
- Auto-profile creation on signup

### AI Chat
- Real AI chat with Vercel AI Gateway
- Productivity assistant context
- Streaming responses
- Full conversation history

### Files
- Real file storage with Vercel Blob (private)
- Upload, download, delete functionality
- File type detection and icons
- Drag and drop upload
- Toast notifications for all actions

### Focus Timer
- Pomodoro timer with configurable durations
- Focus, short break, long break modes
- Session tracking in focus_sessions table
- Audio notifications (optional)

### Settings
- Profile updates (name, email - real DB)
- Theme selection (persisted to user_preferences)
- Notification toggles (persisted)
- Focus timer duration settings (persisted)
- Calendar week start preference (persisted)
- Sound preferences (persisted)
- GitHub Integration (connect/disconnect)

### Projects
- Create, edit, archive projects
- Custom icons (16 options) and colors (7 options)
- Project switcher in sidebar
- Selected project persisted to user_preferences (NOT localStorage)
- Filter tasks, events, notes, habits, goals by project
- GitHub repository linking per project

### GitHub Integration
- OAuth flow with Supabase Auth
- Connect GitHub account in Settings
- Link repositories to projects
- Searchable repository selector
- Unlink repositories
- Open repos in GitHub

### UI/UX Polish
- Toast notifications (react-hot-toast) with Y2K styling
- Skeleton loading components
- Skip-to-content link for accessibility
- ARIA labels on navigation elements
- aria-current for active pages
- aria-expanded/haspopup for dropdowns
- role="listbox" and role="option" for selectors
- aria-labels on icon-only buttons
- role="dialog" on modals

---

## Database Tables (All Created)

- profiles (with github_access_token, github_username)
- events (with project_id)
- tasks (with project_id)
- habits (with project_id)
- habit_completions
- energy_logs
- quick_captures (with project_id)
- focus_sessions (with project_id)
- user_preferences (with selected_project_id)
- projects (with github_repo_url, github_repo_name, github_repo_full_name)
- daily_goals (with project_id)

All have RLS policies and are production-ready.

---

## Production Readiness

### Current Status: ~99% Complete

**Ready for Production:**
- Authentication system
- Database schema with RLS
- Real-time data operations
- AI Chat integration
- File storage
- Focus timer
- Projects organization
- GitHub repository linking
- Settings persistence
- Toast notifications
- Accessibility improvements
- Y2K neobrutalism design

**Optional Future Enhancements:**
- Additional OAuth providers (Google, etc.)
- Real-time collaboration
- Push notifications
- Calendar integrations (Google Calendar, etc.)
- Advanced analytics/reporting
- Team/workspace features

---

## Environment Variables Required

**Supabase (auto-configured):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

**Vercel Blob (auto-configured):**
- `BLOB_READ_WRITE_TOKEN`

**AI (zero-config via Vercel AI Gateway):**
- No API key needed - uses Vercel AI Gateway

**GitHub OAuth (configured in Supabase Dashboard):**
- GitHub OAuth App Client ID
- GitHub OAuth App Client Secret
- Configured in Supabase > Authentication > Providers > GitHub

---

## Design System Notes

- **Colors:** hot pink, electric cyan, neon green, orange, purple, lime, bright yellow
- **Borders:** 4px black borders (neo-brutalism)
- **Shadows:** Chunky offset shadows
- **Background:** Polka dot pattern on light pink/white
- **Fonts:** Emily's Candy (display), Henny Penny (body)
- **Responsive:** Mobile-first with bottom nav, desktop has sidebar
- **Toasts:** Bottom-right position with neo-brutalism styling
