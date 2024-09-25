import { TemplateResult } from 'lit'

export type ItemAction = { value: string; label: string; icon: TemplateResult }

export type IShareApp = {
  id: string
  name: string
  icon: TemplateResult
}

export type LoadingState = '' | 'follow' | 'share' | 'reaction' | 'note' | 'bookmark' | 'highlight'
export type CompletionState = '' | 'follow' | 'share' | 'reaction' | 'note' | 'bookmark' | 'highlight'
export type NostrSelectionDetails = { type: 'quote' | 'highlight' | 'comment'; text: string }
