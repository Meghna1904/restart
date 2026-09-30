import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import type { DistractionReason } from '../lib/database.types'

export function useLogRealityCheck() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      intendedTask,
      wasOnTask,
      distractionReason,
      restarted,
    }: {
      intendedTask: string
      wasOnTask: boolean
      distractionReason?: DistractionReason
      restarted: boolean
    }) => {
      if (!user) throw new Error('Your session has ended. Please enter your name again.')
      const { error } = await supabase.from('reality_checks').insert({
        user_id: user.id,
        intended_task: intendedTask.trim(),
        was_on_task: wasOnTask,
        distraction_reason: distractionReason ?? null,
        restarted,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reality_checks', user?.id] })
    },
    onError: (error) => {
      toast(`Couldn't save that check-in: ${error.message}`, 'error')
    },
  })
}
