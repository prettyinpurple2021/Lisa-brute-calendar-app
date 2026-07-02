import type { Dispatch, SetStateAction } from 'react'
import { Bell, Volume2, Loader2 } from 'lucide-react'
import type { Preferences } from '../preferences'
import { ToggleSwitch } from './ToggleSwitch'

interface NotificationSettingsProps {
  preferences: Preferences
  setPreferences: Dispatch<SetStateAction<Preferences>>
  pushNotifications: {
    isSupported: boolean
    isSubscribed: boolean
    isLoading: boolean
    subscribe: () => Promise<boolean | void>
    unsubscribe: () => Promise<boolean | void>
  }
  loadingPrefs: boolean
}

export function NotificationSettings({
  preferences,
  setPreferences,
  pushNotifications,
  loadingPrefs,
}: NotificationSettingsProps) {
  return (
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
              <p className="font-bold">Push Notifications</p>
              <p className="text-sm text-gray-600">Get notified about focus sessions</p>
              {!pushNotifications.isSupported && (
                <p className="text-xs text-red-500 mt-1">Not supported in this browser</p>
              )}
            </div>
            {pushNotifications.isSupported && (
              <button
                onClick={() => {
                  if (pushNotifications.isSubscribed) {
                    pushNotifications.unsubscribe()
                  } else {
                    pushNotifications.subscribe()
                  }
                }}
                disabled={pushNotifications.isLoading}
                className={`px-4 py-2 border-4 border-black rounded-xl font-bold transition-all ${
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
  )
}
