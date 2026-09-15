import { Calendar, Loader2 } from 'lucide-react'

type WeekStart = 'sunday' | 'monday'

interface CalendarSettingsProps {
  weekStartDay: WeekStart
  onChangeWeekStartDay: (day: WeekStart) => void
  loadingPrefs: boolean
}

export function CalendarSettings({ weekStartDay, onChangeWeekStartDay, loadingPrefs }: CalendarSettingsProps) {
  return (
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
                onClick={() => onChangeWeekStartDay(day)}
                className={`p-4 border-4 border-black rounded-xl font-bold capitalize transition-all neo-hover ${
                  weekStartDay === day
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
  )
}
