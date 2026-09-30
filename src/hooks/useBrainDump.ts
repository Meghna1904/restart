import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { autoCategorize } from '../lib/utils'
import type { BrainCategory } from '../lib/database.types'

export const CATEGORY_META: Record<BrainCategory, { emoji: string; label: string; color: string }> = {
  ideas:    { emoji: '💡', label: 'Ideas',    color: '#ee9b00' },
  learn:    { emoji: '📚', label: 'Learn',    color: '#94d2bd' },
  social:   { emoji: '📱', label: 'Social',   color: '#0a9396' },
  remember: { emoji: '📝', label: 'Remember', color: '#e9d8a6' },
  buy:      { emoji: '🛒', label: 'Buy',      color: '#ca6702' },
  people:   { emoji: '👥', label: 'People',   color: '#005f73' },
  random:   { emoji: '🌀', label: 'Random',   color: '#b9c5bd' },
}

/** All brain items for the user */
export function useBrainItems(category?: BrainCategory | null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['brain_items', user?.id, category],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from('brain_items')
        .select('*')
        .eq('user_id', user!.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (category) q = q.eq('category', category)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

/** Counts per category for the home screen */
export function useBrainCounts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['brain_counts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_items')
        .select('category')
        .eq('user_id', user!.id)
        .eq('archived', false)

      if (error) throw error

      const counts: Partial<Record<BrainCategory, number>> = {}
      let total = 0
      for (const row of data ?? []) {
        const cat = row.category as BrainCategory
        counts[cat] = (counts[cat] ?? 0) + 1
        total++
      }
      return { counts, total }
    },
  })
}

/** Add a brain item — auto-categorizes if no category given */
export function useAddBrainItem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      content,
      category,
      source = 'brain',
    }: {
      content: string
      category?: BrainCategory
      source?: string
    }) => {
      const resolvedCategory = category ?? autoCategorize(content)
      const { data, error } = await supabase
        .from('brain_items')
        .insert({
          user_id: user!.id,
          content: content.trim(),
          category: resolvedCategory,
          source,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brain_items', user?.id] })
      qc.invalidateQueries({ queryKey: ['brain_counts', user?.id] })
    },
    onError: (error) => {
      toast(`Couldn't save that yet: ${error.message}`, 'error')
    },
  })
}

/** Archive (soft-delete) a brain item */
export function useArchiveBrainItem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brain_items')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brain_items', user?.id] })
      qc.invalidateQueries({ queryKey: ['brain_counts', user?.id] })
    },
    onError: (error) => {
      toast(`Couldn't archive that: ${error.message}`, 'error')
    },
  })
}

/** Update category of a brain item */
export function useUpdateBrainCategory() {
  const { user } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, category }: { id: string; category: BrainCategory }) => {
      const { error } = await supabase
        .from('brain_items')
        .update({ category })
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brain_items', user?.id] })
      qc.invalidateQueries({ queryKey: ['brain_counts', user?.id] })
    },
    onError: (error) => {
      toast(`Couldn't update the category: ${error.message}`, 'error')
    },
  })
}
