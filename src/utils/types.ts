import { TemplateResult } from 'lit'

export type ItemAction = { value: string; label: string; icon: TemplateResult }

export type IShareApp = {
  id: string
  name: string
  icon: TemplateResult
}

export type LoadingState = '' | 'follow' | 'share' | 'reaction' | 'note' | 'bookmark'
export type CompletionState = '' | 'follow' | 'share' | 'reaction' | 'note' | 'bookmark'
export type NostrSelectionDetails = { type: 'quote' | 'highlight'; text: string }
