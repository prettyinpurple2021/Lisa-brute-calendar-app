"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
  ListTodo,
  FileText,
  BarChart3,
  MessageCircle,
  FolderOpen,
  Star,
  Zap,
  Heart,
} from "lucide-react"

// App definitions for the 7-app navigation
const apps = [
  { id: "calendar", name: "Calendar", icon: Calendar, color: "bg-primary", shortcut: "1" },
  { id: "tasks", name: "Tasks", icon: ListTodo, color: "bg-secondary", shortcut: "2" },
  { id: "notes", name: "Notes", icon: FileText, color: "bg-accent", shortcut: "3" },
  { id: "analytics", name: "Analytics", icon: BarChart3, color: "bg-lime", shortcut: "4" },
  { id: "chat", name: "AI Chat", icon: MessageCircle, color: "bg-neon-purple", shortcut: "5" },
  { id: "files", name: "Files", icon: FolderOpen, color: "bg-electric-blue", shortcut: "6" },
  { id: "settings", name: "Settings", icon: Settings, color: "bg-hot-orange", shortcut: "7" },
]

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeApp, setActiveApp] = useState("calendar")
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  useEffect(() => {
    setIsLoaded(true)

    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "Looks like you don&apos;t have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      setTypedText("")
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 40)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const [currentView, setCurrentView] = useState("week")
  const [currentMonth] = useState("March 2025")
  const [currentDate] = useState("March 5")
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null)

  const handleEventClick = (event: typeof events[0]) => {
    setSelectedEvent(event)
  }

  const events = [
    {
      id: 1,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-primary",
      day: 1,
      description: "Weekly team sync-up",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
      organizer: "Alice Brown",
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      startTime: "12:30",
      endTime: "13:30",
      color: "bg-lime",
      day: 1,
      description: "Discuss project timeline",
      location: "Cafe Nero",
      attendees: ["Sarah Lee"],
      organizer: "You",
    },
    {
      id: 3,
      title: "Project Review",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-neon-purple",
      day: 3,
      description: "Q2 project progress review",
      location: "Meeting Room 3",
      attendees: ["Team Alpha", "Stakeholders"],
      organizer: "Project Manager",
    },
    {
      id: 4,
      title: "Client Call",
      startTime: "10:00",
      endTime: "11:00",
      color: "bg-accent",
      day: 2,
      description: "Quarterly review with major client",
      location: "Zoom Meeting",
      attendees: ["Client Team", "Sales Team"],
      organizer: "Account Manager",
    },
    {
      id: 5,
      title: "Team Brainstorm",
      startTime: "13:00",
      endTime: "14:30",
      color: "bg-electric-blue",
      day: 4,
      description: "Ideation session for new product features",
      location: "Creative Space",
      attendees: ["Product Team", "Design Team"],
      organizer: "Product Owner",
    },
    {
      id: 6,
      title: "Product Demo",
      startTime: "11:00",
      endTime: "12:00",
      color: "bg-primary",
      day: 5,
      description: "Showcase new features to stakeholders",
      location: "Demo Room",
      attendees: ["Stakeholders", "Dev Team"],
      organizer: "Tech Lead",
    },
    {
      id: 7,
      title: "Marketing Meeting",
      startTime: "13:00",
      endTime: "14:00",
      color: "bg-secondary",
      day: 6,
      description: "Discuss Q3 marketing strategy",
      location: "Marketing Office",
      attendees: ["Marketing Team"],
      organizer: "Marketing Director",
    },
    {
      id: 8,
      title: "Code Review",
      startTime: "15:00",
      endTime: "16:00",
      color: "bg-secondary",
      day: 7,
      description: "Review pull requests for new feature",
      location: "Dev Area",
      attendees: ["Dev Team"],
      organizer: "Senior Developer",
    },
    {
      id: 9,
      title: "Morning Standup",
      startTime: "08:30",
      endTime: "09:30",
      color: "bg-electric-blue",
      day: 2,
      description: "Daily team standup",
      location: "Slack Huddle",
      attendees: ["Development Team"],
      organizer: "Scrum Master",
    },
    {
      id: 10,
      title: "Design Review",
      startTime: "14:30",
      endTime: "15:45",
      color: "bg-neon-purple",
      day: 5,
      description: "Review new UI designs",
      location: "Design Lab",
      attendees: ["UX Team", "Product Manager"],
      organizer: "Lead Designer",
    },
    {
      id: 11,
      title: "Investor Meeting",
      startTime: "10:30",
      endTime: "12:00",
      color: "bg-hot-orange",
      day: 7,
      description: "Quarterly investor update",
      location: "Board Room",
      attendees: ["Executive Team", "Investors"],
      organizer: "CEO",
    },
    {
      id: 12,
      title: "Team Training",
      startTime: "09:30",
      endTime: "11:30",
      color: "bg-lime",
      day: 4,
      description: "New tool onboarding session",
      location: "Training Room",
      attendees: ["All Departments"],
      organizer: "HR",
    },
    {
      id: 13,
      title: "Budget Review",
      startTime: "13:30",
      endTime: "15:00",
      color: "bg-accent",
      day: 3,
      description: "Quarterly budget analysis",
      location: "Finance Office",
      attendees: ["Finance Team", "Department Heads"],
      organizer: "CFO",
    },
    {
      id: 14,
      title: "Client Presentation",
      startTime: "11:00",
      endTime: "12:30",
      color: "bg-hot-orange",
      day: 6,
      description: "Present new project proposal",
      location: "Client Office",
      attendees: ["Sales Team", "Client Representatives"],
      organizer: "Account Executive",
    },
    {
      id: 15,
      title: "Product Planning",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-primary",
      day: 1,
      description: "Roadmap discussion for Q3",
      location: "Strategy Room",
      attendees: ["Product Team", "Engineering Leads"],
      organizer: "Product Manager",
    },
  ]

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8)

  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  const daysInMonth = 31
  const firstDayOffset = 5
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  const myCalendars = [
    { name: "My Calendar", color: "bg-primary" },
    { name: "Work", color: "bg-lime" },
    { name: "Personal", color: "bg-neon-purple" },
    { name: "Family", color: "bg-hot-orange" },
  ]

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background polka-dots">
      {/* Top Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 bg-card neo-border border-t-0 border-x-0 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary neo-border neo-shadow-sm flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Vibe<span className="text-primary">OS</span>
            </span>
          </div>
        </div>

        {/* App Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {apps.map((app, index) => {
            const Icon = app.icon
            const isActive = activeApp === app.id
            return (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                onMouseEnter={() => setHoveredNav(app.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`
                  relative px-3 py-2 neo-border transition-all duration-200 flex items-center gap-2
                  ${isActive 
                    ? `${app.color} text-white neo-shadow-sm -translate-y-0.5` 
                    : "bg-card hover:bg-muted neo-hover"
                  }
                  opacity-0 animate-fade-in
                `}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{app.name}</span>
                <span className="text-xs opacity-60 font-mono">{app.shortcut}</span>
                {hoveredNav === app.id && !isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="neo-border bg-input pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48 text-sm"
            />
          </div>
          <button className="md:hidden p-2 neo-border bg-card neo-hover">
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <div className="w-10 h-10 neo-border bg-primary flex items-center justify-center text-primary-foreground font-bold neo-shadow-sm neo-hover cursor-pointer">
            U
          </div>
        </div>
      </header>

      {/* Mobile App Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card neo-border border-b-0 border-x-0 px-2 py-2">
        <div className="flex items-center justify-around">
          {apps.slice(0, 5).map((app) => {
            const Icon = app.icon
            const isActive = activeApp === app.id
            return (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`
                  p-2 neo-border transition-all duration-200
                  ${isActive 
                    ? `${app.color} text-white neo-shadow-sm -translate-y-1` 
                    : "bg-card"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
          <button className="p-2 neo-border bg-card">
            <span className="text-xs font-bold">...</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 pb-20 lg:pb-4 min-h-screen flex">
        {/* Sidebar */}
        <aside
          className={`hidden md:flex w-64 h-[calc(100vh-4rem)] fixed left-0 top-16 bg-card neo-border border-l-0 border-t-0 p-4 flex-col gap-4 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.2s" }}
        >
          {/* Create Button */}
          <button className="flex items-center justify-center gap-2 neo-border bg-primary text-primary-foreground px-4 py-3 w-full neo-shadow neo-hover font-bold text-lg">
            <Plus className="h-5 w-5" />
            <span>Create</span>
            <Star className="h-4 w-4 animate-sparkle" />
          </button>

          {/* Mini Calendar */}
          <div className="neo-border bg-popover p-3 neo-shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">{currentMonth}</h3>
              <div className="flex gap-1">
                <button className="p-1 neo-border bg-card neo-hover">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-1 neo-border bg-card neo-hover">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-xs text-muted-foreground font-bold py-1">
                  {day}
                </div>
              ))}

              {miniCalendarDays.map((day, i) => (
                <button
                  key={i}
                  className={`text-xs w-7 h-7 flex items-center justify-center transition-all ${
                    day === 5 
                      ? "bg-primary text-primary-foreground neo-border font-bold" 
                      : day 
                        ? "hover:bg-muted neo-hover text-foreground" 
                        : ""
                  } ${!day ? "invisible" : ""}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* My Calendars */}
          <div className="neo-border bg-card p-3 neo-shadow-sm flex-1">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              My Calendars
            </h3>
            <div className="space-y-2">
              {myCalendars.map((cal, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 neo-border ${cal.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-foreground font-medium">{cal.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Action */}
          <button className="w-14 h-14 bg-secondary neo-border neo-shadow flex items-center justify-center neo-hover self-start">
            <Plus className="h-6 w-6 text-secondary-foreground" />
          </button>
        </aside>

        {/* Calendar View */}
        <div
          className={`flex-1 md:ml-64 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.3s" }}
        >
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 neo-border border-t-0 border-x-0 bg-card/50">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 neo-border bg-primary text-primary-foreground font-bold neo-shadow-sm neo-hover">
                Today
              </button>
              <div className="flex">
                <button className="p-2 neo-border bg-card neo-hover border-r-0">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 neo-border bg-card neo-hover">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-foreground">{currentDate}</h2>
            </div>

            <div className="flex items-center neo-border bg-card">
              {["Day", "Week", "Month"].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view.toLowerCase())}
                  className={`px-4 py-2 text-sm font-bold transition-all ${
                    currentView === view.toLowerCase()
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted text-foreground"
                  } ${view !== "Month" ? "border-r-3 border-border" : ""}`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            <div className="neo-border bg-card neo-shadow-lg min-h-full">
              {/* Week Header */}
              <div className="grid grid-cols-8 neo-border border-t-0 border-x-0">
                <div className="p-2 text-center text-muted-foreground text-xs font-mono" />
                {weekDays.map((day, i) => (
                  <div 
                    key={i} 
                    className={`p-2 text-center border-l-3 border-border ${i === 2 ? "bg-accent/20" : ""}`}
                  >
                    <div className="text-xs text-muted-foreground font-bold">{day}</div>
                    <div
                      className={`text-lg font-bold mt-1 transition-all ${
                        weekDates[i] === 5 
                          ? "bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center mx-auto neo-border" 
                          : "text-foreground"
                      }`}
                    >
                      {weekDates[i]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Labels */}
                <div className="text-muted-foreground">
                  {timeSlots.map((time, i) => (
                    <div key={i} className="h-20 border-b-3 border-border pr-2 text-right text-xs font-mono py-1">
                      {time > 12 ? `${time - 12} PM` : `${time} AM`}
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className={`border-l-3 border-border relative ${dayIndex === 2 ? "bg-accent/10" : ""}`}>
                    {timeSlots.map((_, timeIndex) => (
                      <div key={timeIndex} className="h-20 border-b-3 border-border border-dashed" />
                    ))}

                    {/* Events */}
                    {events
                      .filter((event) => event.day === dayIndex + 1)
                      .map((event, i) => {
                        const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                        return (
                          <div
                            key={i}
                            className={`absolute ${event.color} neo-border p-2 text-white text-xs cursor-pointer neo-hover group`}
                            style={{
                              ...eventStyle,
                              left: "4px",
                              right: "4px",
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-bold truncate">{event.title}</div>
                            <div className="opacity-80 text-[10px] mt-1 font-mono">{`${event.startTime} - ${event.endTime}`}</div>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Sparkles className="h-3 w-3" />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 animate-bounce-in">
            <div className="w-[90vw] max-w-[400px] relative bg-card neo-border neo-shadow-lg p-5">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary neo-border" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-secondary neo-border" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent neo-border" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-lime neo-border" />
              
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 neo-border bg-card neo-hover"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center animate-float">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="min-h-[80px] pt-1">
                  <p className="text-sm text-foreground leading-relaxed">{typedText.replace(/&apos;/g, "'")}</p>
                </div>
              </div>
              
              <div className="mt-5 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 neo-border bg-lime text-foreground font-bold neo-hover neo-shadow-sm"
                >
                  Yes!
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 neo-border bg-muted text-foreground font-bold neo-hover"
                >
                  No
                </button>
              </div>
              
              {isPlaying && (
                <div className="mt-4 animate-slide-up">
                  <button
                    className="flex items-center justify-center gap-2 neo-border bg-neon-purple px-4 py-2.5 text-white font-bold neo-hover w-full"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div 
            className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div 
              className={`${selectedEvent.color} neo-border neo-shadow-lg p-6 max-w-md w-full animate-bounce-in`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 neo-border bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="space-y-3 text-white">
                <p className="flex items-center neo-border bg-white/10 p-2">
                  <Clock className="mr-2 h-5 w-5" />
                  <span className="font-mono">{`${selectedEvent.startTime} - ${selectedEvent.endTime}`}</span>
                </p>
                <p className="flex items-center neo-border bg-white/10 p-2">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-center neo-border bg-white/10 p-2">
                  <Calendar className="mr-2 h-5 w-5" />
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
                </p>
                <div className="flex items-start neo-border bg-white/10 p-2">
                  <Users className="mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Attendees</div>
                    <div className="text-sm opacity-90">{selectedEvent.attendees.join(", ") || "No attendees"}</div>
                  </div>
                </div>
                <div className="neo-border bg-white/10 p-2">
                  <div className="font-bold text-sm">Organizer</div>
                  <div className="text-sm opacity-90">{selectedEvent.organizer}</div>
                </div>
                <div className="neo-border bg-white/10 p-2">
                  <div className="font-bold text-sm">Description</div>
                  <div className="text-sm opacity-90">{selectedEvent.description}</div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  className="flex-1 neo-border bg-white text-foreground px-4 py-2 font-bold neo-hover"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
                <button className="flex-1 neo-border bg-white/20 text-white px-4 py-2 font-bold neo-hover">
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
