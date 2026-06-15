import { Palette, Sun, Moon, Monitor, Loader2 } from 'lucide-react'

type Theme = 'light' | 'dark' | 'auto'

interface AppearanceSettingsProps {
  theme: Theme
  onChangeTheme: (theme: Theme) => void
  loadingPrefs: boolean
}

export function AppearanceSettings({ theme, onChangeTheme, loadingPrefs }: AppearanceSettingsProps) {
  return (
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
                onClick={() => onChangeTheme(value as Theme)}
                className={`p-4 border-4 border-black rounded-xl flex flex-col items-center gap-2 transition-all neo-hover ${
                  theme === value
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
  )
}
