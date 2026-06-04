'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { CalendarEvent } from '@/lib/types'
import { useProject } from '@/lib/project-context'
import toast from 'react-hot-toast'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react'
import { MeetingPrepModal } from '@/components/features/meeting-prep-modal'

interface CalendarContentProps {
  initialEvents: CalendarEvent[]
}

const EVENT_COLORS = [
  { id: 'pink', label: 'Pink', class: 'bg-primary' },
  { id: 'cyan', label: 'Cyan', class: 'bg-secondary' },
  { id: 'yellow', label: 'Yellow', class: 'bg-accent' },
  { id: 'lime', label: 'Lime', class: 'bg-lime' },
  { id: 'purple', label: 'Purple', class: 'bg-neon-purple' },
  { id: 'orange', label: 'Orange', class: 'bg-hot-orange' },
]

export function CalendarContent({ initialEvents }: CalendarContentProps) {
  const router = useRouter()
  const [events, setEvents] = useState(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: 'pink',
    allDay: false,
    projectId: null as string | null,
  })
  const [saving, setSaving] = useState(false)
  const [meetingPrepEvent, setMeetingPrepEvent] = useState<CalendarEvent | null>(null)
  
  const { selectedProjectId, projects } = useProject()
  
  // Filter events by selected project
  const filteredEvents = selectedProjectId
    ? events.filter(e => e.project_id === selectedProjectId)
    : events

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days: (Date | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  function navigateMonth(direction: number) {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  function getEventsForDate(date: Date): CalendarEvent[] {
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.start_time)
      return (
        eventStart.getDate() === date.getDate() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getFullYear() === date.getFullYear()
      )
    })
  }

  function openNewEventModal(date: Date) {
    setSelectedDate(date)
    setEditingEvent(null)
    const dateStr = date.toISOString().split('T')[0]
    setFormData({
      title: '',
      description: '',
      startTime: `${dateStr}T09:00`,
      endTime: `${dateStr}T10:00`,
      color: 'pink',
      allDay: false,
      projectId: selectedProjectId,
    })
    setShowEventModal(true)
  }

  function openEditEventModal(event: CalendarEvent) {
    setEditingEvent(event)
    setSelectedDate(new Date(event.start_time))
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: event.start_time.slice(0, 16),
      endTime: event.end_time.slice(0, 16),
      color: event.color,
      allDay: event.all_day,
      projectId: event.project_id,
    })
    setShowEventModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const eventData = {
      user_id: user.id,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      start_time: new Date(formData.startTime).toISOString(),
      end_time: new Date(formData.endTime).toISOString(),
      color: formData.color,
      all_day: formData.allDay,
      project_id: formData.projectId,
    }

    if (editingEvent) {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id)
        .select()
        .single()

      if (error) {
        toast.error('Failed to update event')
      } else if (data) {
        setEvents(events.map(e => e.id === editingEvent.id ? data : e))
        toast.success('Event updated!')
      }
    } else {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (error) {
        toast.error('Failed to create event')
      } else if (data) {
        setEvents([...events, data])
        toast.success('Event created!')
      }
    }

    setSaving(false)
    setShowEventModal(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!editingEvent) return

    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', editingEvent.id)
    
    if (error) {
      toast.error('Failed to delete event')
    } else {
      setEvents(events.filter(e => e.id !== editingEvent.id))
      toast.success('Event deleted!')
    }
    setShowEventModal(false)
    router.refresh()
  }

  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="neo-btn p-2 bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black min-w-[200px] text-center">{monthName}</h2>
          <button
            onClick={() => navigateMonth(1)}
            className="neo-btn p-2 bg-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="neo-btn bg-secondary text-secondary-foreground px-4"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="neo-card overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b-4 border-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-3 text-center font-bold bg-muted border-r-4 border-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayEvents = date ? getEventsForDate(date) : []
            return (
              <div
                key={index}
                className={`min-h-[100px] lg:min-h-[120px] p-2 border-r-4 border-b-4 border-foreground last:border-r-0 [&:nth-child(7n)]:border-r-0 transition-colors ${
                  date ? 'hover:bg-muted/50 cursor-pointer' : 'bg-muted/30'
                } ${date && isToday(date) ? 'bg-primary/10' : ''}`}
                onClick={() => date && openNewEventModal(date)}
              >
                {date && (
                  <>
                    <div className={`text-sm font-bold mb-1 ${
                      isToday(date)
                        ? 'w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center'
                        : ''
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const colorClass = EVENT_COLORS.find(c => c.id === event.color)?.class || 'bg-primary'
                        return (
                          <button
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditEventModal(event)
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs font-semibold truncate ${colorClass} neo-border border-2 hover:opacity-90 transition-opacity`}
                          >
                            {event.title}
                          </button>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <p className="text-xs text-muted-foreground font-medium px-1">
                          +{dayEvents.length - 3} more
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Add Button (Mobile) */}
      <button
        onClick={() => openNewEventModal(new Date())}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 neo-btn bg-primary text-primary-foreground rounded-full flex items-center justify-center neo-shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowEventModal(false)} />
          <div className="relative w-full max-w-md bounce-in">
            <div className="neo-card overflow-hidden">
              {/* Modal Header */}
              <div className="bg-secondary px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
                <h3 className="font-bold">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
                <button onClick={() => setShowEventModal(false)} className="hover:bg-foreground/10 p-1 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="neo-input w-full"
                    placeholder="Event title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="neo-input w-full h-20 resize-none"
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Start</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="neo-input w-full text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">End</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="neo-input w-full text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Color</label>
                  <div className="flex gap-2">
                    {EVENT_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.id })}
                        className={`w-8 h-8 rounded-full ${color.class} ${
                          formData.color === color.id ? 'neo-border ring-2 ring-foreground ring-offset-2' : 'neo-border border-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="w-5 h-5 neo-border"
                  />
                  <label htmlFor="allDay" className="text-sm font-bold">All day event</label>
                </div>

                {/* Project Selector */}
                <div>
                  <label className="block text-sm font-bold mb-1">Project</label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value || null })}
                    className="neo-input w-full"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  {editingEvent && (
                    <>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="neo-btn bg-destructive text-destructive-foreground p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMeetingPrepEvent(editingEvent)
                          setShowEventModal(false)
                        }}
                        className="neo-btn bg-neon-purple text-white p-2 flex items-center gap-1"
                        title="AI Meeting Prep"
                      >
                        <Sparkles className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="neo-btn flex-1 bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Prep Modal */}
      {meetingPrepEvent && (
        <MeetingPrepModal
          event={meetingPrepEvent}
          onClose={() => setMeetingPrepEvent(null)}
        />
      )}
    </div>
  )
}
