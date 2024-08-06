import { Icons } from '../assets/icons'
import { ItemAction } from './types'

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
  repost: {
    value: 'repost',
    label: 'Repost',
    icon: Icons.Share,
  },
  follow: {
    value: 'follow',
    label: 'Follow',
    icon: Icons.Follow,
  },
  "open-with": {
    value: 'open-with',
    label: 'Open with',
    icon: Icons.LinkOut,
  },
}

const CTA_LIST_ATTR = 'data-cta-list'
const CTA_MAIN_ACTION_ATTR = 'data-cta-main'
const BUTTON_COLOR_ATTR = 'data-button-color'
const BUTTON_TEXT_COLOR_ATTR = 'data-text-button-color'

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
}
