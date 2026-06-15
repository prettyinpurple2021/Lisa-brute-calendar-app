import { User as UserIcon, Mail } from 'lucide-react'

interface ProfileSettingsProps {
  displayName: string
  setDisplayName: (name: string) => void
  userEmail: string | undefined
}

export function ProfileSettings({ displayName, setDisplayName, userEmail }: ProfileSettingsProps) {
  return (
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
            <span className="text-gray-500">{userEmail}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
      </div>
    </div>
  )
}
