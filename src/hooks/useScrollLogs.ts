import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { todayLocal } from '../lib/utils'

const hour = new Date().getHours()
const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'night'

export function useScrollLogs() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['scroll_logs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scroll_logs')
        .select('*')
        .eq('user_id', user!.id)
        .order('log_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    },
  })
}

export function useAddScrollLog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ app, minutes, reason }: { app: string; minutes: number; reason?: string }) => {
      if (!user) throw new Error('Your session has ended. Please enter your name again.')
      const { data, error } = await supabase
        .from('scroll_logs')
        .insert({
          user_id: user.id,
          log_date: todayLocal(),
          app,
          minutes,
          time_of_day: timeOfDay,
          reason: reason || null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scroll_logs', user?.id] })
      toast(`${variables.minutes} minutes noted — no judgement attached`, 'success')
    },
    onError: (error) => {
      toast(`Couldn't save that: ${error.message}`, 'error')
    },
  })
}
