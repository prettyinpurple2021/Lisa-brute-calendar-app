'use client'

import { useState } from 'react'
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
} from 'lucide-react'

interface SettingsContentProps {
  user: User
  profile: Profile | null
}

export function SettingsContent({ user, profile }: SettingsContentProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Settings */}
      <div className="neo-card p-6">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5" />
          Profile Settings
        </h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="neo-input w-full"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <div className="neo-input w-full bg-muted flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`neo-btn flex items-center gap-2 ${
              saved ? 'bg-lime' : 'bg-primary text-primary-foreground'
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Preferences - PLACEHOLDER */}
      <div className="neo-card p-6">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5" />
          Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg neo-border border-2">
            <div>
              <p className="font-bold">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark theme</p>
            </div>
            <div className="neo-border bg-card px-3 py-1 rounded text-sm font-bold">
              Coming Soon
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg neo-border border-2">
            <div>
              <p className="font-bold">Week Start</p>
              <p className="text-sm text-muted-foreground">First day of the week</p>
            </div>
            <div className="neo-border bg-card px-3 py-1 rounded text-sm font-bold">
              Coming Soon
            </div>
          </div>
        </div>
        {/* PLACEHOLDER NOTICE */}
        <div className="mt-4 neo-border bg-accent/20 px-3 py-2 rounded-lg">
          <p className="text-xs font-bold">
            PLACEHOLDER: Theme toggle and preferences need implementation
          </p>
        </div>
      </div>

      {/* Notifications - PLACEHOLDER */}
      <div className="neo-card p-6">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg neo-border border-2">
            <div>
              <p className="font-bold">Email Reminders</p>
              <p className="text-sm text-muted-foreground">Daily task reminders</p>
            </div>
            <div className="neo-border bg-card px-3 py-1 rounded text-sm font-bold">
              Coming Soon
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg neo-border border-2">
            <div>
              <p className="font-bold">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Browser notifications</p>
            </div>
            <div className="neo-border bg-card px-3 py-1 rounded text-sm font-bold">
              Coming Soon
            </div>
          </div>
        </div>
        {/* PLACEHOLDER NOTICE */}
        <div className="mt-4 neo-border bg-accent/20 px-3 py-2 rounded-lg">
          <p className="text-xs font-bold">
            PLACEHOLDER: Notification system needs implementation
          </p>
        </div>
      </div>

      {/* Account Actions */}
      <div className="neo-card p-6">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" />
          Account
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="neo-btn w-full bg-muted flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <button
            disabled
            className="neo-btn w-full bg-destructive/10 text-destructive flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account (Coming Soon)
          </button>
        </div>
        {/* PLACEHOLDER NOTICE */}
        <div className="mt-4 neo-border bg-accent/20 px-3 py-2 rounded-lg">
          <p className="text-xs font-bold">
            PLACEHOLDER: Account deletion needs implementation with data cleanup
          </p>
        </div>
      </div>
    </div>
  )
}
