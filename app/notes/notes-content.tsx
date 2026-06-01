'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { QuickCapture } from '@/lib/types'
import {
  Inbox,
  CheckCircle,
  MessageSquare,
  CheckSquare,
  Lightbulb,
  Link2,
  Trash2,
  ArchiveX,
  Plus,
  Filter,
  ArrowRight,
} from 'lucide-react'

interface NotesContentProps {
  initialCaptures: QuickCapture[]
}

const CAPTURE_TYPES = [
  { id: 'thought', name: 'Thought', icon: MessageSquare, color: 'bg-primary' },
  { id: 'task', name: 'Task', icon: CheckSquare, color: 'bg-accent' },
  { id: 'idea', name: 'Idea', icon: Lightbulb, color: 'bg-lime' },
  { id: 'link', name: 'Link', icon: Link2, color: 'bg-secondary' },
] as const

type CaptureType = typeof CAPTURE_TYPES[number]['id']

export function NotesContent({ initialCaptures }: NotesContentProps) {
  const router = useRouter()
  const [captures, setCaptures] = useState(initialCaptures)
  const [filter, setFilter] = useState<'all' | 'unprocessed' | 'processed'>('all')
  const [typeFilter, setTypeFilter] = useState<CaptureType | null>(null)
  const [showNewCapture, setShowNewCapture] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<CaptureType>('thought')
  const [saving, setSaving] = useState(false)

  const filteredCaptures = captures.filter(c => {
    if (filter === 'unprocessed' && c.processed) return false
    if (filter === 'processed' && !c.processed) return false
    if (typeFilter && c.capture_type !== typeFilter) return false
    return true
  })

  const unprocessedCount = captures.filter(c => !c.processed).length

  async function createCapture(e: React.FormEvent) {
    e.preventDefault()
    if (!newContent.trim()) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('quick_captures')
      .insert({
        user_id: user.id,
        content: newContent.trim(),
        capture_type: newType,
      })
      .select()
      .single()

    if (!error && data) {
      setCaptures([data, ...captures])
    }

    setSaving(false)
    setNewContent('')
    setShowNewCapture(false)
    router.refresh()
  }

  async function toggleProcessed(capture: QuickCapture) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quick_captures')
      .update({ processed: !capture.processed })
      .eq('id', capture.id)
      .select()
      .single()

    if (!error && data) {
      setCaptures(captures.map(c => c.id === capture.id ? data : c))
    }
    router.refresh()
  }

  async function deleteCapture(id: string) {
    const supabase = createClient()
    await supabase.from('quick_captures').delete().eq('id', id)
    setCaptures(captures.filter(c => c.id !== id))
    router.refresh()
  }

  async function convertToTask(capture: QuickCapture) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Create task from capture
    await supabase.from('tasks').insert({
      user_id: user.id,
      title: capture.content.slice(0, 100),
      description: capture.content.length > 100 ? capture.content : null,
      status: 'todo',
      priority: 'medium',
    })

    // Mark as processed
    await supabase
      .from('quick_captures')
      .update({ processed: true })
      .eq('id', capture.id)

    setCaptures(captures.map(c => c.id === capture.id ? { ...c, processed: true } : c))
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <div className="neo-card bg-secondary p-3 text-center min-w-[100px]">
            <p className="text-2xl font-black">{unprocessedCount}</p>
            <p className="text-xs font-semibold">Unprocessed</p>
          </div>
          <div className="neo-card bg-lime p-3 text-center min-w-[100px]">
            <p className="text-2xl font-black">{captures.length - unprocessedCount}</p>
            <p className="text-xs font-semibold">Processed</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewCapture(true)}
          className="neo-btn bg-primary text-primary-foreground flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Capture
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 p-1 bg-muted rounded-lg neo-border">
          {(['all', 'unprocessed', 'processed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded font-semibold text-sm transition-all ${
                filter === f ? 'bg-card neo-shadow-sm' : 'hover:bg-card/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all neo-border border-2 ${
              typeFilter === null ? 'bg-muted' : 'bg-card hover:bg-muted'
            }`}
          >
            All Types
          </button>
          {CAPTURE_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                  typeFilter === type.id
                    ? `${type.color} neo-border`
                    : 'bg-card hover:bg-muted neo-border border-2'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Captures List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCaptures.map((capture) => {
          const typeConfig = CAPTURE_TYPES.find(t => t.id === capture.capture_type)!
          const TypeIcon = typeConfig.icon
          return (
            <div
              key={capture.id}
              className={`neo-card p-4 transition-all ${
                capture.processed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`flex items-center gap-2 px-2 py-1 rounded ${typeConfig.color}`}>
                  <TypeIcon className="w-4 h-4" />
                  <span className="text-xs font-bold capitalize">{capture.capture_type}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(capture.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="font-medium mb-4 whitespace-pre-wrap">{capture.content}</p>
              
              <div className="flex items-center gap-2 pt-2 border-t-2 border-muted">
                <button
                  onClick={() => toggleProcessed(capture)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                    capture.processed
                      ? 'bg-lime text-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {capture.processed ? 'Processed' : 'Mark Done'}
                </button>
                
                {!capture.processed && capture.capture_type !== 'task' && (
                  <button
                    onClick={() => convertToTask(capture)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-accent hover:bg-accent/80 transition-all"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    To Task
                  </button>
                )}
                
                <button
                  onClick={() => deleteCapture(capture.id)}
                  className="ml-auto p-1 rounded text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCaptures.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-bold text-muted-foreground">No captures found</p>
          <p className="text-sm text-muted-foreground">
            {filter !== 'all' || typeFilter
              ? 'Try adjusting your filters'
              : 'Press Cmd+K anywhere to quick capture'}
          </p>
        </div>
      )}

      {/* New Capture Modal */}
      {showNewCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowNewCapture(false)} />
          <div className="relative w-full max-w-lg bounce-in">
            <div className="neo-card overflow-hidden">
              <div className="bg-lime px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
                <h3 className="font-bold">New Capture</h3>
                <button onClick={() => setShowNewCapture(false)} className="hover:bg-foreground/10 p-1 rounded">
                  <ArchiveX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={createCapture} className="p-4 space-y-4">
                <div className="flex gap-2">
                  {CAPTURE_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewType(type.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                          newType === type.id
                            ? `${type.color} neo-border neo-shadow-sm`
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{type.name}</span>
                      </button>
                    )
                  })}
                </div>

                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    newType === 'thought' ? "What's on your mind?" :
                    newType === 'task' ? "What needs to be done?" :
                    newType === 'idea' ? "What's your brilliant idea?" :
                    "Paste a link..."
                  }
                  className="neo-input w-full h-32 resize-none"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!newContent.trim() || saving}
                  className="neo-btn w-full bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Capture'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
