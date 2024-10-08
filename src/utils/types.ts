import { TemplateResult } from 'lit'

export type ItemAction = { value: string; label: string; icon: TemplateResult }

export type IShareApp = {
  id: string
  name: string
  icon: TemplateResult
}

export interface Reaction {
  id: string
  icon: any
  count: number
  pubkeys?: string[]
  accent?: boolean
}

export interface Zap {
  id: string
  amount: number
  pubkey: string
  profile: {
    picture: string
    name: string
  }
  comment: string
  accent?: boolean
}

export type LoadingState = '' | 'follow' | 'share' | 'reaction' | 'note' | 'bookmark' | 'highlight'
export type CompletionState = '' | 'follow' | 'share' | 'reaction' | 'note' | 'bookmark' | 'highlight' | 'zap'
export type NostrSelectionDetails = { type: 'quote' | 'highlight' | 'comment'; text: string }
