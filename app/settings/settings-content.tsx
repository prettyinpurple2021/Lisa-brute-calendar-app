'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import {
  User as UserIcon,
  Mail,
  Save,
  LogOut,
  Trash2,
  Bell,
  Palette,
  Shield,
  Clock,
  Calendar,
  Sun,
  Moon,
  Monitor,
  Volume2,
  Loader2,
  Github,
  Link,
  Unlink,
  Check,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react'
import { usePushNotifications } from '@/lib/use-push-notifications'
import { exportToCSV, exportToPDF, ExportType } from '@/lib/export-utils'

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
  }, [supabase, user.id])

  // Check for GitHub connection status from URL params
  useEffect(() => {
    const githubStatus = searchParams.get('github')
    if (githubStatus === 'connected') {
      setGithubConnected(true)
      toast.success('GitHub connected successfully!')
      // Clean URL
      router.replace('/settings')
    } else if (githubStatus === 'error') {
      toast.error('Failed to connect GitHub. Please try again.')
      router.replace('/settings')
    }
  }, [searchParams, router])

  async function connectGithub() {
    const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:user user:email',
        redirectTo: `${redirectUrl}/auth/github/callback`,
      },
    })

    if (error) {
      toast.error('Failed to connect GitHub')
    }
  }

  async function disconnectGithub() {
    if (!confirm('Are you sure you want to disconnect GitHub? This will unlink all repositories from your projects.')) {
      return
    }

    setDisconnectingGithub(true)
    
    const response = await fetch('/api/github/disconnect', { method: 'POST' })
    
    if (response.ok) {
      setGithubConnected(false)
      setGithubUsername(null)
      toast.success('GitHub disconnected')
      router.refresh()
    } else {
      toast.error('Failed to disconnect GitHub')
    }
    
    setDisconnectingGithub(false)
  }

  async function handleExport(type: ExportType, format: 'csv' | 'pdf') {
    setExporting(`${type}-${format}`)
    try {
      if (format === 'csv') {
        await exportToCSV(type)
      } else {
        await exportToPDF(type)
      }
      toast.success(`${type} exported as ${format.toUpperCase()}`)
    } catch (err) {
      toast.error(`Failed to export ${type}`)
    }
    setExporting(null)
  }

  async function handleSaveAll() {
    setSaving(true)
    setSaveStatus('idle')

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // Upsert preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

    setSaving(false)

    if (profileError || prefsError) {
      setSaveStatus('error')
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }

    router.refresh()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 border-4 border-black rounded-full transition-colors ${
          checked ? 'bg-lime' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-0 w-5 h-5 bg-white border-2 border-black rounded-full transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Settings */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-hot-pink flex items-center justify-center border-2 border-black">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          Profile Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-hot-pink/30"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <div className="w-full px-4 py-3 border-4 border-black rounded-xl bg-gray-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">{user.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* GitHub Integration */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center border-2 border-black">
            <Github className="w-4 h-4 text-white" />
          </div>
          GitHub Integration
        </h3>
        
        {githubConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border-4 border-black rounded-xl bg-lime/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime flex items-center justify-center border-2 border-black">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">GitHub Connected</p>
                  {githubUsername && (
                    <p className="text-sm text-gray-600">@{githubUsername}</p>
                  )}
                </div>
              </div>
              <button
                onClick={disconnectGithub}
                disabled={disconnectingGithub}
                className="flex items-center gap-2 px-4 py-2 border-4 border-black rounded-xl font-bold bg-white hover:bg-red-50 text-red-600 transition-colors neo-hover"
              >
                {disconnectingGithub ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Disconnect
              </button>
            </div>
            <p className="text-sm text-gray-600">
              You can link GitHub repositories to your projects from the Projects page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Connect your GitHub account to link repositories to your projects and track your coding progress.
            </p>
            <button
              onClick={connectGithub}
              className="flex items-center gap-2 px-6 py-3 border-4 border-black rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors neo-hover"
            >
              <Github className="w-5 h-5" />
              Connect GitHub
            </button>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-electric-cyan flex items-center justify-center border-2 border-black">
            <Palette className="w-4 h-4 text-white" />
          </div>
          Appearance
        </h3>
        {loadingPrefs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-electric-cyan" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-bold mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'auto', icon: Monitor, label: 'System' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPreferences({ ...preferences, theme: value as Theme })}
                  className={`p-4 border-4 border-black rounded-xl flex flex-col items-center gap-2 transition-all neo-hover ${
                    preferences.theme === value
                      ? 'bg-electric-cyan text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-lime flex items-center justify-center border-2 border-black">
            <Bell className="w-4 h-4 text-black" />
          </div>
          Notifications
        </h3>
        {loadingPrefs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-lime" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border-4 border-black rounded-xl">
              <div>
                <p className="font-bold">Push Notifications</p>
                <p className="text-sm text-gray-600">
                  {!pushNotifications.isSupported 
                    ? 'Not supported in this browser' 
                    : pushNotifications.isSubscribed 
                    ? 'Enabled - you will receive browser notifications'
                    : 'Click to enable browser notifications'}
                </p>
              </div>
              {pushNotifications.isSupported && (
                <button
                  onClick={pushNotifications.isSubscribed ? pushNotifications.unsubscribe : pushNotifications.subscribe}
                  disabled={pushNotifications.isLoading}
                  className={`px-4 py-2 border-4 border-black rounded-xl font-bold transition-colors neo-hover ${
                    pushNotifications.isSubscribed ? 'bg-lime' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {pushNotifications.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pushNotifications.isSubscribed ? (
                    'Enabled'
                  ) : (
                    'Enable'
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between p-4 border-4 border-black rounded-xl">
              <div>
                <p className="font-bold">Email Reminders</p>
                <p className="text-sm text-gray-600">Get email notifications for events</p>
              </div>
              <ToggleSwitch
                checked={preferences.email_reminders}
                onChange={(v) => setPreferences({ ...preferences, email_reminders: v })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border-4 border-black rounded-xl">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <div>
                  <p className="font-bold">Sound Effects</p>
                  <p className="text-sm text-gray-600">Play sounds for timers</p>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.sound_enabled}
                onChange={(v) => setPreferences({ ...preferences, sound_enabled: v })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Focus Timer Settings */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-neon-purple flex items-center justify-center border-2 border-black">
            <Clock className="w-4 h-4 text-white" />
          </div>
          Focus Timer
        </h3>
        {loadingPrefs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Focus (min)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={preferences.focus_timer_duration}
                onChange={(e) => setPreferences({ ...preferences, focus_timer_duration: parseInt(e.target.value) || 25 })}
                className="w-full px-3 py-3 border-4 border-black rounded-xl font-bold text-center text-xl focus:outline-none focus:ring-4 focus:ring-neon-purple/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Break (min)</label>
              <input
                type="number"
                min={1}
                max={15}
                value={preferences.break_duration}
                onChange={(e) => setPreferences({ ...preferences, break_duration: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-3 border-4 border-black rounded-xl font-bold text-center text-xl focus:outline-none focus:ring-4 focus:ring-lime/30"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Long (min)</label>
              <input
                type="number"
                min={5}
                max={30}
                value={preferences.long_break_duration}
                onChange={(e) => setPreferences({ ...preferences, long_break_duration: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-3 border-4 border-black rounded-xl font-bold text-center text-xl focus:outline-none focus:ring-4 focus:ring-electric-cyan/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Calendar Settings */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-hot-orange flex items-center justify-center border-2 border-black">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Calendar
        </h3>
        {loadingPrefs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-hot-orange" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-bold mb-3">Week Starts On</label>
            <div className="grid grid-cols-2 gap-3">
              {(['sunday', 'monday'] as WeekStart[]).map((day) => (
                <button
                  key={day}
                  onClick={() => setPreferences({ ...preferences, week_start_day: day })}
                  className={`p-4 border-4 border-black rounded-xl font-bold capitalize transition-all neo-hover ${
                    preferences.week_start_day === day
                      ? 'bg-hot-orange text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Data */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center border-2 border-black">
            <Download className="w-4 h-4 text-white" />
          </div>
          Export Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Download your data as CSV or PDF files.
        </p>
        <div className="space-y-3">
          {([
            { type: 'tasks', label: 'Tasks', icon: '✓' },
            { type: 'events', label: 'Events', icon: '📅' },
            { type: 'habits', label: 'Habits', icon: '🎯' },
            { type: 'notes', label: 'Notes', icon: '📝' },
            { type: 'time-sessions', label: 'Time Sessions', icon: '⏱️' },
          ] as { type: ExportType; label: string; icon: string }[]).map(({ type, label, icon }) => (
            <div key={type} className="flex items-center justify-between p-3 border-4 border-black rounded-xl">
              <div className="flex items-center gap-2">
                <span>{icon}</span>
                <span className="font-bold">{label}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport(type, 'csv')}
                  disabled={exporting === `${type}-csv`}
                  className="flex items-center gap-1 px-3 py-1.5 border-3 border-black rounded-lg font-bold text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  {exporting === `${type}-csv` ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3 h-3" />
                  )}
                  CSV
                </button>
                <button
                  onClick={() => handleExport(type, 'pdf')}
                  disabled={exporting === `${type}-pdf`}
                  className="flex items-center gap-1 px-3 py-1.5 border-3 border-black rounded-lg font-bold text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  {exporting === `${type}-pdf` ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <FileText className="w-3 h-3" />
                  )}
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="border-4 border-black rounded-3xl p-6 bg-white neo-shadow">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-2 border-black">
            <Shield className="w-4 h-4 text-white" />
          </div>
          Account
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full p-4 border-4 border-black rounded-xl font-bold flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors neo-hover"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <button
            disabled
            className="w-full p-4 border-4 border-black rounded-xl font-bold flex items-center justify-center gap-2 bg-red-100 text-red-600 opacity-50 cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account (Coming Soon)
          </button>
        </div>
      </div>

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
