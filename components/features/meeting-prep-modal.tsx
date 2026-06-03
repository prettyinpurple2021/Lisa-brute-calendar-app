'use client'

import { useState } from 'react'
import { Sparkles, X, Loader2, Copy, Check, RefreshCw } from 'lucide-react'
import type { CalendarEvent } from '@/lib/types'

interface MeetingPrepModalProps {
  event: CalendarEvent
  onClose: () => void
}

export function MeetingPrepModal({ event, onClose }: MeetingPrepModalProps) {
  const [prep, setPrep] = useState('')
  const [loading, setLoading] = useState(false)
  const [additionalContext, setAdditionalContext] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generatePrep() {
    setLoading(true)
    setPrep('')
    setError(null)

    try {
      const response = await fetch('/api/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventDescription: event.description,
          additionalContext,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate meeting prep')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      // Parse SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text-delta' && parsed.delta) {
                fullContent += parsed.delta
                setPrep(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(prep)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden neo-shadow animate-bounce-in">
        {/* Header */}
        <div className="p-4 border-b-4 border-black bg-gradient-to-r from-neon-purple to-electric-cyan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">AI Meeting Prep</h2>
                <p className="text-white/80 text-sm font-medium truncate max-w-xs">
                  {event.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!prep && !loading && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Additional Context (optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any extra context about the meeting, attendees, or goals..."
                  className="w-full px-4 py-3 border-4 border-black rounded-xl font-medium resize-none h-24 focus:outline-none focus:ring-4 focus:ring-neon-purple/30"
                />
              </div>

              <button
                onClick={generatePrep}
                className="w-full py-4 bg-gradient-to-r from-neon-purple to-hot-pink text-white font-black text-lg border-4 border-black rounded-xl neo-hover flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Meeting Prep
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-10 h-10 animate-spin text-neon-purple mb-4" />
              <p className="font-bold text-gray-600">Generating your meeting prep...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border-4 border-red-500 rounded-xl">
              <p className="font-bold text-red-600">{error}</p>
              <button
                onClick={generatePrep}
                className="mt-2 text-sm font-bold text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          {prep && !loading && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none border-4 border-black rounded-xl p-4 bg-gray-50">
                <div className="whitespace-pre-wrap font-medium">{prep}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 border-4 border-black rounded-xl font-bold flex items-center justify-center gap-2 bg-lime hover:bg-lime/80 transition-colors neo-hover"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={generatePrep}
                  className="py-3 px-4 border-4 border-black rounded-xl font-bold flex items-center justify-center gap-2 bg-electric-cyan hover:bg-electric-cyan/80 transition-colors neo-hover"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
