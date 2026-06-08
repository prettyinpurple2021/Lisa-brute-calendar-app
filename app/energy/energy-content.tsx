'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { EnergyLog } from '@/lib/types'
import toast from 'react-hot-toast'
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryCharging,
  Plus,
  Trash2,
  Edit3,
  X,
  Calendar,
  TrendingUp,
} from 'lucide-react'

interface EnergyContentProps {
  initialEnergyLogs: EnergyLog[]
}

const ENERGY_LEVELS = [
  { level: 1, icon: BatteryLow, label: 'Very Low', color: 'bg-destructive' },
  { level: 2, icon: BatteryLow, label: 'Low', color: 'bg-hot-orange' },
  { level: 3, icon: BatteryMedium, label: 'Medium', color: 'bg-accent' },
  { level: 4, icon: BatteryFull, label: 'High', color: 'bg-lime' },
  { level: 5, icon: BatteryCharging, label: 'Peak', color: 'bg-secondary' },
]

export function EnergyContent({ initialEnergyLogs }: EnergyContentProps) {
  const router = useRouter()
  const [logs, setLogs] = useState(initialEnergyLogs)
  const [showModal, setShowModal] = useState(false)
  const [editingLog, setEditingLog] = useState<EnergyLog | null>(null)
  const [formData, setFormData] = useState({ level: 3, notes: '' })
  const [saving, setSaving] = useState(false)

  function openNewModal() {
    setEditingLog(null)
    setFormData({ level: 3, notes: '' })
    setShowModal(true)
  }

  function openEditModal(log: EnergyLog) {
    setEditingLog(log)
    setFormData({ level: log.level, notes: log.notes || '' })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingLog) {
      const { data, error } = await supabase
        .from('energy_logs')
        .update({
          level: formData.level,
          notes: formData.notes || null,
        })
        .eq('id', editingLog.id)
        .select()
        .single()

      if (!error && data) {
        setLogs(logs.map(l => l.id === editingLog.id ? data : l))
        toast.success('Energy log updated!')
      } else {
        toast.error('Failed to update log')
      }
    } else {
      const { data, error } = await supabase
        .from('energy_logs')
        .insert({
          user_id: user.id,
          level: formData.level,
          notes: formData.notes || null,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!error && data) {
        setLogs([data, ...logs])
        toast.success('Energy logged!')
      } else {
        toast.error('Failed to log energy')
      }
    }

    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  async function deleteLog(id: string) {
    if (!confirm('Delete this energy log?')) return

    const supabase = createClient()
    const { error } = await supabase.from('energy_logs').delete().eq('id', id)

    if (!error) {
      setLogs(logs.filter(l => l.id !== id))
      toast.success('Energy log deleted!')
    } else {
      toast.error('Failed to delete log')
    }
  }

  // Calculate stats
  const avgLevel = logs.length > 0 
    ? (logs.reduce((sum, l) => sum + l.level, 0) / logs.length).toFixed(1)
    : '-'
  const highest = logs.length > 0 ? Math.max(...logs.map(l => l.level)) : 0
  const lowest = logs.length > 0 ? Math.min(...logs.map(l => l.level)) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Energy Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your energy levels throughout the day</p>
        </div>
        <button
          onClick={openNewModal}
          className="neo-btn bg-secondary text-secondary-foreground flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Energy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neo-card p-4 bg-secondary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary rounded-lg neo-border flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{avgLevel}</p>
              <p className="text-xs font-semibold text-muted-foreground">Average Level</p>
            </div>
          </div>
        </div>

        <div className="neo-card p-4 bg-lime/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lime rounded-lg neo-border flex items-center justify-center">
              <BatteryFull className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{highest}</p>
              <p className="text-xs font-semibold text-muted-foreground">Highest Level</p>
            </div>
          </div>
        </div>

        <div className="neo-card p-4 bg-destructive/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive rounded-lg neo-border flex items-center justify-center">
              <BatteryLow className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{lowest}</p>
              <p className="text-xs font-semibold text-muted-foreground">Lowest Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Logs List */}
      {logs.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Battery className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No energy logs yet</h3>
          <p className="text-muted-foreground">Start tracking your energy levels to see patterns and trends</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const levelConfig = ENERGY_LEVELS[log.level - 1] || ENERGY_LEVELS[2]
            const LevelIcon = levelConfig.icon
            return (
              <div key={log.id} className="neo-card p-4 flex items-center justify-between gap-4">
                <div className={`w-12 h-12 rounded-lg neo-border flex items-center justify-center flex-shrink-0 ${levelConfig.color}`}>
                  <LevelIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold">{levelConfig.label} Energy</p>
                    <span className="text-sm text-muted-foreground">Level {log.level}</span>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.logged_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(log)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bounce-in">
            <div className="neo-card overflow-hidden">
              <div className="bg-secondary px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
                <h3 className="font-bold">{editingLog ? 'Edit Energy Log' : 'Log Energy'}</h3>
                <button onClick={() => setShowModal(false)} className="hover:bg-foreground/10 p-1 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-3">Energy Level</label>
                  <div className="space-y-2">
                    {ENERGY_LEVELS.map((config) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={config.level}
                          type="button"
                          onClick={() => setFormData({ ...formData, level: config.level })}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-3 transition-all ${
                            formData.level === config.level
                              ? `${config.color} neo-border neo-shadow-sm`
                              : 'border-muted hover:border-muted-foreground/50 bg-card'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{config.label}</span>
                          <span className="ml-auto text-sm opacity-60">{config.level}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="neo-input w-full h-24 resize-none"
                    placeholder="What's affecting your energy? (e.g., 'Great sleep', 'Skipped lunch', etc.)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="neo-btn w-full bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingLog ? 'Update Log' : 'Log Energy'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
