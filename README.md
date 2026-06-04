# VibeOS - Solo Founder Command Center

A comprehensive productivity platform designed for solo founders and entrepreneurs. Built with Next.js 15, Supabase, and a vibrant Y2K neobrutalism design aesthetic.

## Features

### Core Apps
- **Dashboard** - Daily overview with goals, events, tasks, habits, and energy tracking
- **Calendar** - Full calendar with event management and AI meeting prep
- **Tasks** - Kanban-style task management with priorities, time tracking, and recurring tasks
- **Notes** - Quick capture and note-taking with project organization
- **Analytics** - Habit tracking with streaks, heatmaps, and productivity insights
- **Focus Timer** - Pomodoro-style timer with customizable sessions
- **AI Chat** - AI-powered assistant for brainstorming and productivity help
- **Files** - File storage and management with Vercel Blob
- **Projects** - Project management with GitHub repository integration
- **Settings** - User preferences, theme customization, and data export

### Key Features
- Full authentication with email/password (Supabase Auth)
- GitHub OAuth integration for repository linking
- Push notifications (browser notifications)
- Data export (CSV and PDF)
- Recurring tasks and events
- Time tracking with sessions
- Daily goal planning
- Energy level logging
- Project-based filtering across all apps
- Keyboard shortcuts
- Accessibility features (ARIA labels, skip links)
- Responsive design (mobile-first)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Vercel Blob
- **AI**: Vercel AI Gateway
- **Styling**: Tailwind CSS
- **UI Components**: Custom neobrutalism design system
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Vercel account (for Blob storage)

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token

# Optional: GitHub OAuth (for repository linking)
# Configure in Supabase Dashboard > Authentication > Providers > GitHub

# Optional: Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vibeos.git

# Install dependencies
pnpm install

# Run database migrations (in Supabase Dashboard or via CLI)
# See /supabase/migrations for schema

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

### Core Tables
- `profiles` - User profiles and preferences
- `projects` - User projects with GitHub integration
- `events` - Calendar events
- `tasks` - Tasks with priorities, status, and time tracking
- `notes` - Notes and quick captures
- `habits` - Habit definitions
- `habit_completions` - Daily habit tracking
- `energy_logs` - Energy level tracking
- `daily_goals` - Daily goal planning
- `quick_captures` - Quick capture inbox
- `time_sessions` - Time tracking sessions
- `push_subscriptions` - Push notification subscriptions
- `user_preferences` - User settings and preferences

All tables have Row Level Security (RLS) enabled for data isolation.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Quick Capture |
| `Cmd/Ctrl + 1-9` | Navigate to apps |
| `G then H` | Go to Dashboard |
| `?` | Show shortcuts help |
| `Esc` | Close modals |

## API Routes

- `/api/github/repos` - Fetch user's GitHub repositories
- `/api/github/disconnect` - Disconnect GitHub integration
- `/api/export` - Export data (CSV/PDF)
- `/api/notifications/subscribe` - Push notification subscription

## Deployment

The app is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel Dashboard
3. Deploy

The app will automatically deploy on every push to the main branch.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@vibeos.app or open an issue in the repository.

---

Built with [v0](https://v0.app) and [Next.js](https://nextjs.org)
