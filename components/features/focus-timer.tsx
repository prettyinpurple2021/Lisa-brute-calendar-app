'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

interface FocusSession {
  id: string
  sessionType: 'focus' | 'short_break' | 'long_break'
  durationMinutes: number
  isRunning: boolean
  remainingSeconds: number
  completedSessions: number
}

export function FocusTimer() {
  const supabase = createClient()
  const [session, setSession] = useState<FocusSession>({
    id: '',
    sessionType: 'focus',
    durationMinutes: 25,
    isRunning: false,
    remainingSeconds: 25 * 60,
    completedSessions: 0,
  })

  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Timer logic
  useEffect(() => {
    if (!session.isRunning) return

    timerRef.current = setInterval(() => {
      setSession((prev) => {
        const newRemaining = prev.remainingSeconds - 1

        if (newRemaining <= 0) {
          // Session complete
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => {})
          }

          // Auto-advance to next session
          let nextType: 'focus' | 'short_break' | 'long_break' = 'focus'
          let nextDuration = 25

          if (prev.sessionType === 'focus') {
            nextType = prev.completedSessions % 4 === 3 ? 'long_break' : 'short_break'
            nextDuration = nextType === 'long_break' ? 15 : 5
          }

          return {
            ...prev,
            sessionType: nextType,
            durationMinutes: nextDuration,
            remainingSeconds: nextDuration * 60,
            completedSessions:
              prev.sessionType === 'focus' ? prev.completedSessions + 1 : prev.completedSessions,
            isRunning: false,
          }
        }

        return { ...prev, remainingSeconds: newRemaining }
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session.isRunning, soundEnabled])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setSession((prev) => ({ ...prev, isRunning: !prev.isRunning }))
  }

  const resetTimer = () => {
    setSession({
      ...session,
      remainingSeconds: session.durationMinutes * 60,
      isRunning: false,
    })
  }

  const switchSession = (type: 'focus' | 'short_break' | 'long_break') => {
    const durations = { focus: 25, short_break: 5, long_break: 15 }
    const duration = durations[type]
    setSession({
      ...session,
      sessionType: type,
      durationMinutes: duration,
      remainingSeconds: duration * 60,
      isRunning: false,
    })
  }

  const sessionColors = {
    focus: 'border-hot-pink shadow-hot-pink',
    short_break: 'border-lime shadow-lime',
    long_break: 'border-electric-cyan shadow-electric-cyan',
  }

  const sessionBgColors = {
    focus: 'bg-hot-pink/10',
    short_break: 'bg-lime/10',
    long_break: 'bg-electric-cyan/10',
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Timer Display */}
      <div
        className={`border-4 ${sessionColors[session.sessionType]} rounded-3xl p-8 mb-6 text-center neo-shadow ${sessionBgColors[session.sessionType]}`}
      >
        <div className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
          {session.sessionType === 'focus'
            ? 'Focus Time'
            : session.sessionType === 'short_break'
              ? 'Short Break'
              : 'Long Break'}
        </div>
        <div className="text-7xl font-black text-foreground font-mono tracking-tighter mb-4">
          {formatTime(session.remainingSeconds)}
        </div>
        <div className="text-sm text-gray-600">Sessions completed: {session.completedSessions}</div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={toggleTimer}
          className="flex-1 bg-hot-pink border-4 border-black rounded-2xl p-4 font-bold uppercase text-black neo-shadow hover:neo-hover active:neo-active transition-all"
        >
          {session.isRunning ? (
            <Pause className="w-5 h-5 mx-auto" />
          ) : (
            <Play className="w-5 h-5 mx-auto" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="flex-1 bg-electric-cyan border-4 border-black rounded-2xl p-4 font-bold uppercase text-black neo-shadow hover:neo-hover active:neo-active transition-all"
        >
          <RotateCcw className="w-5 h-5 mx-auto" />
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex-1 bg-lime border-4 border-black rounded-2xl p-4 font-bold uppercase text-black neo-shadow hover:neo-hover active:neo-active transition-all"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 mx-auto" />
          ) : (
            <VolumeX className="w-5 h-5 mx-auto" />
          )}
        </button>
      </div>

      {/* Session Switcher */}
      <div className="grid grid-cols-3 gap-3">
        {(['focus', 'short_break', 'long_break'] as const).map((type) => (
          <button
            key={type}
            onClick={() => switchSession(type)}
            className={`border-3 border-black rounded-xl p-3 font-bold text-xs uppercase tracking-wider transition-all neo-shadow ${
              session.sessionType === type
                ? 'bg-hot-pink text-black scale-105'
                : 'bg-white text-black hover:scale-102'
            }`}
          >
            {type === 'focus' ? 'Focus' : type === 'short_break' ? 'Break' : 'Long'}
          </button>
        ))}
      </div>

      {/* Audio for timer complete */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" />
    </div>
  )
}
