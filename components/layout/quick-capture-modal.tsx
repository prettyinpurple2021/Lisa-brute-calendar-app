'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Zap, Lightbulb, CheckSquare, Link2, MessageSquare } from 'lucide-react'

interface QuickCaptureModalProps {
  open: boolean
  onClose: () => void
}

const captureTypes = [
  { id: 'thought', name: 'Thought', icon: MessageSquare, color: 'bg-primary' },
  { id: 'task', name: 'Task', icon: CheckSquare, color: 'bg-accent' },
  { id: 'idea', name: 'Idea', icon: Lightbulb, color: 'bg-lime' },
  { id: 'link', name: 'Link', icon: Link2, color: 'bg-secondary' },
] as const

type CaptureType = typeof captureTypes[number]['id']

export function QuickCaptureModal({ open, onClose }: QuickCaptureModalProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<CaptureType>('thought')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
    if (!open) {
      setContent('')
      setType('thought')
      setSaved(false)
    }
  }, [open])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSaving(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    const { error } = await supabase.from('quick_captures').insert({
      user_id: user.id,
      content: content.trim(),
      capture_type: type,
    })

    setSaving(false)

    if (!error) {
      setSaved(true)
      setTimeout(() => {
        onClose()
      }, 800)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bounce-in">
        <div className="neo-card p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-secondary px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-bold">Quick Capture</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-foreground/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              {captureTypes.map((t) => {
                const Icon = t.icon
                const isSelected = type === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? `${t.color} neo-border neo-shadow-sm`
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{t.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Input */}
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'thought' ? "What's on your mind?" :
                type === 'task' ? "What needs to be done?" :
                type === 'idea' ? "What's your brilliant idea?" :
                "Paste a link..."
              }
              className="neo-input w-full h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e)
                }
              }}
            />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border border-foreground/20">Cmd+Enter</kbd> to save
              </p>
              <button
                type="submit"
                disabled={!content.trim() || saving}
                className={`neo-btn px-6 transition-all ${
                  saved
                    ? 'bg-lime text-foreground'
                    : 'bg-primary text-primary-foreground'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Capture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
