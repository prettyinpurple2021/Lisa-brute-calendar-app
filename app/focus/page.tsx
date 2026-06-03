'use client'

import { AppShell } from '@/components/layout/app-shell'
import { FocusTimer } from '@/components/features/focus-timer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FocusPage() {
  return (
    <AppShell currentPage="focus">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold mb-8 p-2 hover:bg-hot-pink/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-2">Focus Timer</h1>
          <p className="text-gray-600">
            Stay focused with the Pomodoro technique. Work in focused sprints with breaks in between.
          </p>
        </div>

        <div className="bg-white border-4 border-black rounded-3xl p-8 neo-shadow">
          <FocusTimer />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="border-4 border-black rounded-2xl p-4 bg-hot-pink/5">
            <div className="font-bold text-sm uppercase mb-2">Focus</div>
            <div className="text-2xl font-black">25 min</div>
          </div>
          <div className="border-4 border-black rounded-2xl p-4 bg-lime/5">
            <div className="font-bold text-sm uppercase mb-2">Short Break</div>
            <div className="text-2xl font-black">5 min</div>
          </div>
          <div className="border-4 border-black rounded-2xl p-4 bg-electric-cyan/5">
            <div className="font-bold text-sm uppercase mb-2">Long Break</div>
            <div className="text-2xl font-black">15 min</div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
