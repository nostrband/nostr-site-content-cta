import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { TWStyles } from './modules/tw/twlit'

import { Icons } from './assets/icons'

import { EmojiClickEvent } from 'emoji-picker-element/shared'
import { CompletionState, ItemAction, LoadingState } from './utils/types'

import {
  ACTIONS,
  BUTTON_COLOR_ATTR,
  BUTTON_TEXT_COLOR_ATTR,
  CTA_LIST_ATTR,
  CTA_MAIN_ACTION_ATTR,
  DEFAULT_BUTTON_COLOR,
  DEFAULT_BUTTON_TEXT_COLOR,
  DEFAULT_MAIN_ACTION,
  NPUB_ATTR,
} from './utils/const'
import {
  getAuthorPubkey,
  getCompletionForEvent,
  prepareActionsList,
  publishBookmark,
  publishFollow,
  publishHighlight,
  publishNote,
  publishReaction,
  publishReply,
} from './utils/helpers'

import 'emoji-picker-element'
import './components'
import { ContentSelection } from './components'

async function waitNostrSite() {
  // @ts-ignore
  if (!window.nostrSite) await new Promise<Event>((ok) => document.addEventListener('npLoad', ok))

  // @ts-ignore
  return window.nostrSite.plugins.register('content-cta')
}

@customElement('np-content-cta')
export class NostrContentCta extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property({ attribute: false }) buttonColor = DEFAULT_BUTTON_COLOR
  @property({ attribute: false }) buttonTextColor = DEFAULT_BUTTON_TEXT_COLOR
  @property({ attribute: false }) actions: ItemAction[] = []
  @property({ attribute: false }) mainAction: ItemAction = DEFAULT_MAIN_ACTION
  @property({ attribute: NPUB_ATTR }) npub: string = ''

  @state() private actionsModalOpen = false
  @state() private showEmojiPicker = false
  @state() private showShareOptions = false
  @state() private appsModalOpen = false
  @state() private nostrShareModalOpen = false
  @state() private ready = false
  @state() private updateTrigger: number = 0
  @state() private loading: LoadingState = ''
  @state() private completion: CompletionState = ''
  @state() private authorName: string = ''
  @state() private authorAvatar: string = ''

  @state() private nostrText: string = ''
  @state() private highlightText: string = ''
  @state() private nostrReply = false

  pluginEndpoint: any | undefined = undefined

  connectedCallback(): void {
    super.connectedCallback()
    this.id = 'np-content-cta'

    const mainAction = this.getAttribute(CTA_MAIN_ACTION_ATTR) || 'zap'
    this.mainAction = ACTIONS[mainAction]

    const actions = this.getAttribute(CTA_LIST_ATTR) || Object.keys(ACTIONS).join(',')
    this.actions = prepareActionsList(actions, mainAction)

    this.buttonColor = this.getAttribute(BUTTON_COLOR_ATTR) || DEFAULT_BUTTON_COLOR
    this.buttonTextColor = this.getAttribute(BUTTON_TEXT_COLOR_ATTR) || DEFAULT_BUTTON_TEXT_COLOR

    waitNostrSite().then((ep) => {
      this.pluginEndpoint = ep
      this.pluginEndpoint.subscribe('action-open-with', () => {
        this._handleOpenAppsModal()
      })
      this.pluginEndpoint.subscribe('action-like', () => {
        this._handleShowEmojiPicker()
      })
      this.pluginEndpoint.subscribe('action-share', () => {
        this._handleShowShareOptions()
      })
      this.pluginEndpoint.subscribe('event-published', (e: any) => {
        console.log('content-cta on event published', e)
        this.updateTrigger = Date.now()
        const completion = getCompletionForEvent(e)
        if (completion) this._handleShowCompletionModal(completion)
      })
      this.pluginEndpoint.subscribe('action-follow', () => {
        this._handleFollow()
      })
      this.pluginEndpoint.subscribe('action-bookmark', () => {
        this._handleBookmark()
      })
      this.pluginEndpoint.subscribe('action-quote', (text: string) => {
        this._handleSelectionChange('quote', text)
      })
      this.pluginEndpoint.subscribe('action-highlight', (text: string) => {
        this._handleSelectionChange('highlight', text)
      })
      this.pluginEndpoint.subscribe('action-comment', (text: string) => {
        this._handleSelectionChange('comment', text)
      })

      ;(document.querySelector('np-content-cta-selection') as ContentSelection).onAction =
        this._handleSelectionChange.bind(this)

      console.log('content-cta ready')
      this.ready = true

      // @ts-ignore
      const nostrSite = window.nostrSite
      nostrSite.tabReady.then(async () => {
        const renderer = nostrSite.renderer
        const profiles = await renderer.fetchProfiles([getAuthorPubkey()])
        if (profiles.length) {
          this.authorName = profiles[0].profile.display_name || profiles[0].profile.display_name
          this.authorAvatar = profiles[0].profile.picture
        }
      })
    })
  }

  private _handleOpenActionsModal() {
    this.actionsModalOpen = true
  }
  private _handleCloseActionsModal() {
    this.actionsModalOpen = false
  }
  private _handleOpenAppsModal() {
    this.appsModalOpen = true
  }
  private _handleCloseAppsModal() {
    this.appsModalOpen = false
  }

  private _handleShowEmojiPicker() {
    this.showEmojiPicker = true
  }

  private _handleCloseEmojiPicker() {
    this.showEmojiPicker = false
  }

  private _handleShowShareOptions() {
    this.showShareOptions = true
  }

  private _handleCloseShareOptions() {
    this.showShareOptions = false
  }

  private _handleShowCompletionModal(completion: CompletionState) {
    this.completion = completion
  }

  private _handleCloseCompletionModal() {
    this.completion = ''
  }

  private _handleCloseNostrShareModal() {
    this.nostrShareModalOpen = false
  }

  private _handleShowNostrShareModal() {
    this.nostrShareModalOpen = true
  }

  private _handleSelectionChange(type: string, text: string) {
    if (type === 'quote') {
      this._initNostrText() // reset
      // prepend the quote
      this.nostrText = '> ' + text + '\n' + this.nostrText
      this.highlightText = '' // reset
      this.nostrReply = false
    } else if (type === 'comment') {
      // quote
      this.nostrText = '> ' + text + '\n'
      this.highlightText = '' // reset
      this.nostrReply = true
    } else if (type === 'highlight') {
      this.nostrText = '' // clear, it's optional
      this.highlightText = text
      this.nostrReply = false
    }

    // doesn't work in sync way
    setTimeout(() => {
      this._handleShowNostrShareModal()
    }, 0)
  }

  private _handleCloseModal() {
    this._handleCloseActionsModal()
    this._handleCloseAppsModal()
    this._handleCloseEmojiPicker()
    this._handleCloseShareOptions()
    this._handleCloseCompletionModal()
    this._handleCloseNostrShareModal()
  }

  private _onSelectionAction(type: string, text: string) {
    this.pluginEndpoint?.dispatch(`action-${type}`, text)
  }

  private _handleButtonClick(type: string) {
    this.pluginEndpoint?.dispatch(`action-${type}`)
    // close the actions modal
    this.actionsModalOpen = false
  }

  private async _publishReaction(event: EmojiClickEvent) {
    if (!event.detail.unicode) return

    try {
      this.loading = 'reaction'
      const nostrEvent = await publishReaction(event.detail.unicode!)
      // a generalized way to notify nostr-site about the new relevant event
      this.pluginEndpoint?.dispatch('event-published', nostrEvent)
      this.loading = ''
    } catch {
      this.loading = ''
    }
  }

  private async _publishNote(text: string) {
    try {
      this.loading = 'note'
      const nostrEvent = await publishNote(text)
      this.pluginEndpoint?.dispatch('event-published', nostrEvent)
      this.loading = ''
    } catch {
      this.loading = ''
    }
  }

  private async _publishHighlight(text: string, comment: string) {
    try {
      this.loading = 'highlight'
      const nostrEvent = await publishHighlight(text, comment)
      this.pluginEndpoint?.dispatch('event-published', nostrEvent)
      this.loading = ''
    } catch {
      this.loading = ''
    }
  }

  private async _publishReply(text: string) {
    try {
      this.loading = 'note'
      const nostrEvent = await publishReply(text)
      this.pluginEndpoint?.dispatch('event-published', nostrEvent)
      this.loading = ''
    } catch {
      this.loading = ''
    }
  }

  private async _handleFollow() {
    const npub = document.querySelector('meta[name="nostr:author"]')?.getAttribute('content')
    console.log('follow npub', npub)
    if (!npub || !npub.startsWith('npub')) return
    try {
      this.loading = 'follow'
      // @ts-ignore
      const nostrSite = window.nostrSite
      const pubkey = nostrSite.nostrTools.nip19.decode(npub).data
      console.log('follow pubkey', pubkey)

      const nostrEvent = await publishFollow(pubkey)
      this.pluginEndpoint?.dispatch('event-published', nostrEvent)
      this.loading = ''
    } catch {
      this.loading = ''
    }
  }

  private async _handleBookmark() {
    try {
      this.loading = 'bookmark'
      const nostrEvent = await publishBookmark()
      this.pluginEndpoint?.dispatch('event-published', nostrEvent)
      this.loading = ''
    } catch {
      this.loading = ''
    }
  }

  private _handleShareNostr() {
    this._initNostrText() // reset
    this.highlightText = '' // clear
    return this._handleShowNostrShareModal()
  }

  private _initNostrText() {
    // @ts-ignore
    const nostrSite: any = window.nostrSite
    if (!nostrSite) return

    const id = document.querySelector('meta[name="nostr:id"]')?.getAttribute('content') || ''
    const nip19 = nostrSite.nostrTools.nip19
    const renderer = nostrSite.renderer
    const site = renderer.getSite()
    const relay = site.contributor_relays && site.contributor_relays.length ? site.contributor_relays[0] : ''

    let text = id
    if (relay) {
      const { type, data } = nip19.decode(id)
      if (type === 'note') text = nip19.neventEncode({ id: data, relays: [relay] })
      else if (type === 'naddr') text = nip19.naddrEncode({ ...data, relays: [relay] })
    }
    console.log('text', text, id, relay)
    this.nostrText = `\nnostr:${text}`
  }

  private isCompletion() {
    return !!this.getCompletionText()
  }

  private getCompletionText() {
    switch (this.completion) {
      case 'bookmark':
        return 'Thank you for your bookmark!'
      case 'follow':
        return 'Thank you for following!'
      case 'note':
        return 'Thank you for posting!'
      case 'reaction':
        return 'Thank you for your reaction!'
      case 'share':
        return 'Thank you for sharing!'
      case 'highlight':
        return 'Thank you for highlighting!'
    }
  }

  renderActionsModal() {
    if (!this.actionsModalOpen || this.appsModalOpen || this.showEmojiPicker || this.showShareOptions) return nothing

    return html`
      <np-content-cta-modal @close-modal=${this._handleCloseModal.bind(this)} .title=${'Actions'}>
        <div class="flex flex-col gap-[8px]">
          ${this.actions.map((action) => {
            return html` <button
              @click=${() => this._handleButtonClick(action.value)}
              id="${action.value}"
              class="p-[8px] hover:bg-slate-50 rounded-[2px] transition-colors active:bg-slate-100 border-2 flex justify-center gap-[8px] items-center"
              ${action.value === this.mainAction.value ? `style="background-color: ${this.buttonColor}"` : ``}
            >
              <div class="w-[80%] flex justify-end">
                <div class="w-[24px] h-[24px]">${action.icon}</div>
              </div>

              <div class="w-full flex justify-start">
                <div>${action.label}</div>
              </div>
            </button>`
          })}
        </div>
      </np-content-cta-modal>
    `
  }

  render() {
    return html`
      <div class="w-full flex flex-col gap-[8px]">
        <np-content-cta-zaps
          .ready=${this.ready}
          .npub=${this.npub}
          .accent=${this.buttonColor}
          .updateTrigger=${this.updateTrigger}
        ></np-content-cta-zaps>

        <np-content-cta-reactions
          .ready=${this.ready}
          .npub=${this.npub}
          .accent=${this.buttonColor}
          .updateTrigger=${this.updateTrigger}
        ></np-content-cta-reactions>

        <np-content-main-cta
          @main-cta-click=${() => this._handleButtonClick(this.mainAction.value)}
          @dots-click=${this._handleOpenActionsModal.bind(this)}
          .buttonColor=${this.buttonColor}
          .buttonTextColor=${this.buttonTextColor}
          .mainAction=${this.mainAction}
        ></np-content-main-cta>
      </div>

      ${this.renderActionsModal()}

      <np-content-cta-modal-apps @close-modal=${this._handleCloseModal.bind(this)} .open=${this.appsModalOpen}>
      </np-content-cta-modal-apps>

      <np-content-cta-modal-emoji
        @close-modal=${this._handleCloseModal.bind(this)}
        .open=${this.showEmojiPicker}
        .publish=${this._publishReaction.bind(this)}
      >
      </np-content-cta-modal-emoji>

      <np-content-cta-modal-share-apps
        @close-modal=${this._handleCloseModal.bind(this)}
        .open=${this.showShareOptions}
        .onShareNostr=${this._handleShareNostr.bind(this)}
        .accent=${this.buttonColor}
        .ready=${this.ready}
        .openModal=${this._handleShowShareOptions.bind(this)}
      >
      </np-content-cta-modal-share-apps>

      <np-content-cta-modal-loading .open=${!!this.loading} .loading=${this.loading}></np-content-cta-modal-loading>

      <np-content-cta-modal-completion
        @close-modal=${this._handleCloseModal.bind(this)}
        .open=${this.isCompletion()}
        .title=${this.authorName}
        .avatar=${this.authorAvatar}
        .text=${this.getCompletionText()}
        .buttonText=${'Continue'}
      ></np-content-cta-modal-completion>

      <np-content-cta-modal-nostr-share
        @close-modal=${this._handleCloseModal.bind(this)}
        .open=${this.nostrShareModalOpen}
        .publishNote=${this._publishNote.bind(this)}
        .publishReply=${this._publishReply.bind(this)}
        .publishHighlight=${this._publishHighlight.bind(this)}
        .text=${this.nostrText}
        .reply=${this.nostrReply}
        .accent=${this.buttonColor}
        .highlightText=${this.highlightText}
      >
      </np-content-cta-modal-nostr-share>
    `
    // <np-content-cta-selection .onAction=${this._onSelectionAction.bind(this)}></np-content-cta-selection>
  }
}

export * from './modules/init'
