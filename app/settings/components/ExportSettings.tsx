import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { ExportType } from '@/lib/export-utils'

interface ExportSettingsProps {
  handleExport: (type: ExportType, format: 'csv' | 'pdf') => Promise<void>
  exporting: string | null
}

export function ExportSettings({ handleExport, exporting }: ExportSettingsProps) {
  return (
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
  )
}
