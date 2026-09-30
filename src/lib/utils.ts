import { format } from 'date-fns'

/** Auto-categorize a brain dump item by content */
export type BrainCategory = 'ideas' | 'learn' | 'social' | 'remember' | 'buy' | 'people' | 'random'

export function autoCategorize(text: string): BrainCategory {
  const t = text.toLowerCase()

  // Ideas — app, build, feature, concept
  if (/\b(idea|app|feature|build|create|make a|startup|product|concept|what if|i should make)\b/.test(t)) return 'ideas'

  // Learn — understand, study, figure out
  if (/\b(learn|understand|study|why does|why is|how does|how do|figure out|research|read about|look up)\b/.test(t)) return 'learn'

  // Buy — shopping
  if (/\b(buy|get a|order|purchase|need to get|pick up|add to cart)\b/.test(t)) return 'buy'

  // Social — content, posts
  if (/\b(post|caption|share|instagram|twitter|tweet|reel|story|content|tiktok)\b/.test(t)) return 'social'

  // Remember — explicit memory
  if (/\b(remember|don't forget|remind me|note to self|must|important to)\b/.test(t)) return 'remember'

  // People — interactions
  if (/\b(call|text|message|email|tell|ask|talk to|meet|catch up with|thank|apologize)\b/.test(t)) return 'people'

  return 'random'
}

/** Returns today's date as a YYYY-MM-DD string in the user's LOCAL timezone */
export function todayLocal(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Format minutes as "1h 25m" or "45m" */
export function fmtMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/** Format seconds as MM:SS */
export function fmtSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Elapsed seconds from an ISO timestamp */
export function elapsedSeconds(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
}

/** Greeting based on time of day */
export function greeting(name?: string | null): string {
  const h = new Date().getHours()
  const who = name ? `, ${name}` : ''
  if (h < 12) return `good morning${who} ☀️`
  if (h < 17) return `hey${who} :)`
  return `good evening${who} 🌙`
}

/** Days since a date */
export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
