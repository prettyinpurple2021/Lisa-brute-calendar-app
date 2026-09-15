interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
}

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
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
