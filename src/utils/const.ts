import { Icons } from '../assets/icons'
import { IShareApp, ItemAction } from './types'

const ACTIONS: Record<string, ItemAction> = {
  zap: {
    value: 'zap',
    label: 'Zap',
    icon: Icons.Light,
  },
  like: {
    value: 'like',
    label: 'Like',
    icon: Icons.Like,
  },
  bookmark: {
    value: 'bookmark',
    label: 'Bookmark',
    icon: Icons.Bookmark,
  },
  share: {
    value: 'share',
    label: 'Share',
    icon: Icons.Share,
  },
  follow: {
    value: 'follow',
    label: 'Follow',
    icon: Icons.Follow,
  },
  'open-with': {
    value: 'open-with',
    label: 'Open with',
    icon: Icons.LinkOut,
  },
}

const SELECTION_ACTIONS: Record<string, ItemAction> = {
  comment: {
    value: 'comment',
    label: 'Comment',
    icon: Icons.Comment,
  },
  quote: {
    value: 'quote',
    label: 'Quote',
    icon: Icons.Quotes,
  },
  highlight: {
    value: 'highlight',
    label: 'Highlight',
    icon: Icons.Highlight,
  },
}

const APPS: IShareApp[] = [
  {
    id: 'nostr',
    name: 'Nostr',
    icon: Icons.Nostr,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Icons.TwitterX,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Icons.Facebook,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: Icons.Reddit,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: Icons.Pinterest,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Icons.Telegram,
  },
  {
    id: 'linkedin',
    name: 'Linkedin',
    icon: Icons.Linkedin,
  },
  {
    id: 'email',
    name: 'Email',
    icon: Icons.Mail,
  },
]

const CTA_LIST_ATTR = 'data-cta-list'
const CTA_MAIN_ACTION_ATTR = 'data-cta-main'
const BUTTON_COLOR_ATTR = 'data-button-color'
const BUTTON_TEXT_COLOR_ATTR = 'data-text-button-color'
const NPUB_ATTR = 'data-user-npub'

const DEFAULT_BUTTON_COLOR = '#245b9e'
const DEFAULT_BUTTON_TEXT_COLOR = '#fff'
const DEFAULT_MAIN_ACTION = ACTIONS['zap']

export {
  CTA_LIST_ATTR,
  CTA_MAIN_ACTION_ATTR,
  BUTTON_COLOR_ATTR,
  BUTTON_TEXT_COLOR_ATTR,
  DEFAULT_BUTTON_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  DEFAULT_MAIN_ACTION,
  ACTIONS,
  SELECTION_ACTIONS,
  NPUB_ATTR,
  APPS,
}
