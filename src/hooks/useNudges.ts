import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { NudgeType, NudgeResponse } from '../lib/database.types'

/** Nudge definitions — gentle, time-aware suggestions */
export const NUDGES: Record<NudgeType, { emoji: string; messages: string[] }> = {
  move: {
    emoji: '🌱',
    messages: [
      "You've been sitting for a while. Want to go outside for 10 minutes?",
      "A short walk might help clear your head.",
      "How about stepping outside? Even 5 minutes counts.",
    ],
  },
  study: {
    emoji: '📚',
    messages: [
      "You haven't touched DSA today. Want to do one problem?",
      "Want to spend 20 minutes with a problem? No pressure.",
      "One problem. That's it. Want to try?",
    ],
  },
  brain: {
    emoji: '🧠',
    messages: [
      "What's been on your mind lately? Dump it here.",
      "Anything floating around in your head right now?",
      "Got any half-formed ideas? This is a safe place for them.",
    ],
  },
  checkin: {
    emoji: '🌿',
    messages: [
      "How are you actually doing today?",
      "No agenda — just checking in.",
      "Hey. How's it going?",
    ],
  },
}

/** Get a nudge appropriate for the current time of day */
export function getCurrentNudgeType(): NudgeType {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'study'
  if (h >= 11 && h < 15) return 'brain'
  if (h >= 15 && h < 20) return 'move'
  return 'checkin'
}

export function getNudgeMessage(type: NudgeType): string {
  const msgs = NUDGES[type].messages
  return msgs[Math.floor(Math.random() * msgs.length)]
}

/** Recent nudge responses (last 24h) */
export function useRecentNudgeResponses() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['nudge_responses', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('nudge_responses')
        .select('*')
        .eq('user_id', user!.id)
        .gte('responded_at', since)
        .order('responded_at', { ascending: false })
      if (error) throw error
      return data
    },
    staleTime: 60_000,
  })
}

/** Whether we should show a nudge right now */
export function useShouldShowNudge() {
  const { data: recent } = useRecentNudgeResponses()
  if (!recent) return false
  // Don't show nudge if last response was within 3 hours
  if (recent.length === 0) return true
  const lastResponded = new Date(recent[0].responded_at).getTime()
  return Date.now() - lastResponded > 3 * 60 * 60 * 1000
}

/** Log a nudge response */
export function useLogNudgeResponse() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      nudge_type,
      nudge_message,
      response,
    }: {
      nudge_type: NudgeType
      nudge_message: string
      response: NudgeResponse
    }) => {
      const { error } = await supabase
        .from('nudge_responses')
        .insert({ user_id: user!.id, nudge_type, nudge_message, response })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nudge_responses', user?.id] })
    },
  })
}
