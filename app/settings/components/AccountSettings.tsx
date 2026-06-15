import { Shield, LogOut, Trash2 } from 'lucide-react'

interface AccountSettingsProps {
  handleSignOut: () => Promise<void>
}

export function AccountSettings({ handleSignOut }: AccountSettingsProps) {
  return (
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
  )
}
