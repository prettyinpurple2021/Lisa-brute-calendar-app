'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
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
} from 'lucide-react'

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
  const supabase = createClient()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [loadingPrefs, setLoadingPrefs] = useState(true)
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
              <div>
                <p className="font-bold">Push Notifications</p>
                <p className="text-sm text-gray-600">Browser notifications for reminders</p>
              </div>
              <ToggleSwitch
                checked={preferences.push_notifications}
                onChange={(v) => setPreferences({ ...preferences, push_notifications: v })}
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
