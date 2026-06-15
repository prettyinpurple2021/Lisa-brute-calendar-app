'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { Save, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/lib/use-push-notifications'
import { exportToCSV, exportToPDF, ExportType } from '@/lib/export-utils'

import { ProfileSettings } from './components/ProfileSettings'
import { GithubSettings } from './components/GithubSettings'
import { AppearanceSettings } from './components/AppearanceSettings'
import { NotificationSettings } from './components/NotificationSettings'
import { FocusTimerSettings } from './components/FocusTimerSettings'
import { CalendarSettings } from './components/CalendarSettings'
import { ExportSettings } from './components/ExportSettings'
import { AccountSettings } from './components/AccountSettings'

type Theme = 'light' | 'dark' | 'auto'
type WeekStart = 'sunday' | 'monday'

interface Preferences {
  theme: Theme
  email_reminders: boolean
  push_notifications: boolean
  week_start_day: WeekStart
  focus_timer_duration: number
  break_duration: number
  long_break_duration: number
  sound_enabled: boolean
}

interface SettingsContentProps {
  user: User
  profile: Profile | null
}

export function SettingsContent({ user, profile }: SettingsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [githubConnected, setGithubConnected] = useState(!!profile?.github_access_token)
  const [githubUsername, setGithubUsername] = useState(profile?.github_username || null)
  const [disconnectingGithub, setDisconnectingGithub] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const pushNotifications = usePushNotifications()
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'light',
    email_reminders: true,
    push_notifications: true,
    week_start_day: 'monday',
    focus_timer_duration: 25,
    break_duration: 5,
    long_break_duration: 15,
    sound_enabled: true,
  })

  useEffect(() => {
    async function loadPreferences() {
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPreferences({
          theme: data.theme || 'light',
          email_reminders: data.email_reminders ?? true,
          push_notifications: data.push_notifications ?? true,
          week_start_day: data.week_start_day || 'monday',
          focus_timer_duration: data.focus_timer_duration || 25,
          break_duration: data.break_duration || 5,
          long_break_duration: data.long_break_duration || 15,
          sound_enabled: data.sound_enabled ?? true,
        })
      }
      setLoadingPrefs(false)
    }

    loadPreferences()
  }, [user.id, supabase])

  useEffect(() => {
    if (searchParams.get('github_connected') === 'true') {
      setGithubConnected(true)
      const username = searchParams.get('username')
      if (username) setGithubUsername(username)
      toast.success('Successfully connected to GitHub!')

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('github_connected')
      newUrl.searchParams.delete('username')
      window.history.replaceState({}, '', newUrl.toString())
    }
    if (searchParams.get('github_error') === 'true') {
      toast.error('Failed to connect to GitHub. Please try again.')

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('github_error')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  async function connectGithub() {
    window.location.href = '/api/auth/github'
  }

  async function disconnectGithub() {
    setDisconnectingGithub(true)
    try {
      const response = await fetch('/api/auth/github/disconnect', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      setGithubConnected(false)
      setGithubUsername(null)
      toast.success('Successfully disconnected from GitHub')
      router.refresh()
    } catch (error) {
      console.error('Error disconnecting from GitHub:', error)
      toast.error('Failed to disconnect from GitHub')
    } finally {
      setDisconnectingGithub(false)
    }
  }

  async function handleExport(type: ExportType, format: 'csv' | 'pdf') {
    setExporting(`${type}-${format}`)
    try {
      let data
      switch (type) {
        case 'tasks':
          const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id)
          data = tasks
          break
        case 'events':
          const { data: events } = await supabase.from('events').select('*').eq('user_id', user.id)
          data = events
          break
        case 'habits':
          const { data: habits } = await supabase.from('habits').select('*').eq('user_id', user.id)
          data = habits
          break
        case 'notes':
          const { data: notes } = await supabase.from('notes').select('*').eq('user_id', user.id)
          data = notes
          break
        case 'time-sessions':
          const { data: sessions } = await supabase.from('time_sessions').select('*').eq('user_id', user.id)
          data = sessions
          break
      }

      if (!data || data.length === 0) {
        toast.error(`No ${type} found to export`)
        return
      }

      const filename = `${type}-export-${new Date().toISOString().split('T')[0]}`

      if (format === 'csv') {
        const csvString = await exportToCSV(data as any)
        const blob = new Blob([csvString as any], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}.csv`
        link.click()
      } else {
        exportToPDF(data as any, filename)
      }

      toast.success(`Successfully exported ${type} as ${format.toUpperCase()}`)
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
      toast.error(`Failed to export ${type}`)
    } finally {
      setExporting(null)
    }
  }

  async function handleSaveAll() {
    setSaving(true)
    setSaveStatus('idle')

    try {
      if (displayName !== profile?.display_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', user.id)

        if (profileError) throw profileError
      }

      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })

      if (prefsError) throw prefsError

      setSaveStatus('saved')
      toast.success('Settings saved successfully!')

      if (preferences.theme !== (profile as any)?.preferences?.theme) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProfileSettings
        displayName={displayName}
        setDisplayName={setDisplayName}
        userEmail={user.email}
      />

      <GithubSettings
        githubConnected={githubConnected}
        githubUsername={githubUsername}
        disconnectGithub={disconnectGithub}
        disconnectingGithub={disconnectingGithub}
        connectGithub={connectGithub}
      />

      <AppearanceSettings
        theme={preferences.theme}
        onChangeTheme={(theme) => setPreferences({ ...preferences, theme })}
        loadingPrefs={loadingPrefs}
      />

      <NotificationSettings
        preferences={preferences}
        setPreferences={setPreferences}
        pushNotifications={pushNotifications}
        loadingPrefs={loadingPrefs}
      />

      <FocusTimerSettings
        preferences={preferences}
        setPreferences={setPreferences}
        loadingPrefs={loadingPrefs}
      />

      <CalendarSettings
        weekStartDay={preferences.week_start_day}
        onChangeWeekStartDay={(day) => setPreferences({ ...preferences, week_start_day: day })}
        loadingPrefs={loadingPrefs}
      />

      <ExportSettings
        handleExport={handleExport}
        exporting={exporting}
      />

      <AccountSettings
        handleSignOut={handleSignOut}
      />

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-4 border-4 border-black rounded-2xl font-black text-lg transition-all neo-hover ${
            saveStatus === 'saved'
              ? 'bg-lime text-black'
              : saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-hot-pink text-white'
          }`}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
