export type Theme = 'light' | 'dark' | 'auto'
export type WeekStart = 'sunday' | 'monday'

export interface Preferences {
  theme: Theme
  email_reminders: boolean
  push_notifications: boolean
  week_start_day: WeekStart
  focus_timer_duration: number
  break_duration: number
  long_break_duration: number
  sound_enabled: boolean
}
