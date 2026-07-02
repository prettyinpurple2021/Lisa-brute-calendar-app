import type { Dispatch, SetStateAction } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import type { Preferences } from '../preferences'

interface FocusTimerSettingsProps {
  preferences: Preferences
  setPreferences: Dispatch<SetStateAction<Preferences>>
  loadingPrefs: boolean
}

export function FocusTimerSettings({ preferences, setPreferences, loadingPrefs }: FocusTimerSettingsProps) {
  return (
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
  )
}
