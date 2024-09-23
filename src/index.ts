import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { EmojiClickEvent } from 'emoji-picker-element/shared'
import { TWStyles } from './modules/tw/twlit'
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
import { CompletionState, ItemAction, LoadingState } from './utils/types'
import { Icons } from './assets/icons'
import { prepareActionsList, publishBookmark, publishFollow, publishNote, publishReaction } from './utils/helpers'
import './components'
import { ModalApps, ModalLogin } from './components'
import 'emoji-picker-element'

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

  @state() actionsModalOpen = false
  @state() showEmojiPicker = false
  @state() showShareOptions = false
  @state() appsModalOpen = false
  @state() ready = false
  @state() private updateTrigger: number = 0
  @state() private loading: LoadingState = ''
  @state() private completion: CompletionState = ''

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
      })
      this.pluginEndpoint.subscribe('action-follow', () => {
        this._handleFollow()
      })
      this.pluginEndpoint.subscribe('action-bookmark', () => {
        this._handleBookmark()
      })
      console.log('content-cta ready')
      this.ready = true
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

  private _handleCloseModal() {
    this._handleCloseActionsModal()
    this._handleCloseAppsModal()
    this._handleCloseEmojiPicker()
    this._handleCloseShareOptions()
    this._handleCloseCompletionModal()
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
      this._handleShowCompletionModal('reaction')
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
      this._handleShowCompletionModal('note')
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
      this._handleShowCompletionModal('follow')
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
      this._handleShowCompletionModal('bookmark')
    } catch {
      this.loading = ''
    }
  }

  private _handleToggleShareOptions() {
    if (this.showShareOptions) this.showShareOptions = false
    else this.showShareOptions = true
  }

  renderActionsModal() {
    if (!this.actionsModalOpen || this.appsModalOpen || this.showEmojiPicker || this.showShareOptions) return nothing

    return html`
      <np-content-cta-modal @close-modal=${this._handleCloseModal} .title=${'Actions'}>
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

        <div class="w-full flex align-middle gap-[12px]">
          <button
            class=" w-full border-2 rounded-[5px] p-[6px] hover:opacity-95 active:opacity-85 transition-opacity flex justify-center gap-[8px] items-center"
            style="background-color: ${this.buttonColor}; color: ${this.buttonTextColor}"
            @click=${() => this._handleButtonClick(this.mainAction.value)}
          >
            <div class="w-[24px] h-[24px]">${this.mainAction.icon}</div>
            ${this.mainAction.label}
          </button>
          <button
            class="p-[8px] hover:bg-slate-50 rounded-[5px] transition-colors active:bg-slate-100 "
            @click=${this._handleOpenActionsModal}
          >
            ${Icons.Dots}
          </button>
        </div>
      </div>

      ${this.renderActionsModal()}

      <np-content-cta-modal-apps @close-modal=${this._handleCloseModal} .open=${this.appsModalOpen}>
      </np-content-cta-modal-apps>

      <np-content-cta-modal-emoji
        @close-modal=${this._handleCloseModal}
        .open=${this.showEmojiPicker}
        .publish=${this._publishReaction.bind(this)}
      >
      </np-content-cta-modal-emoji>

      <np-content-cta-modal-share-apps
        @close-modal=${this._handleCloseModal}
        .open=${this.showShareOptions}
        .publishNote=${this._publishNote.bind(this)}
        .accent=${this.buttonColor}
        .ready=${this.ready}
        .openModal=${this._handleShowShareOptions.bind(this)}
      >
      </np-content-cta-modal-share-apps>

      <np-content-cta-modal-loading .open=${!!this.loading}></np-content-cta-modal-loading>

      <np-content-cta-modal-completion
        @close-modal=${this._handleCloseCompletionModal}
        .open=${!!this.completion}
        .title=${'Username'}
        .text=${html`<div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque, esse harum ipsum error sit voluptatum, est
          similique voluptates cum aspernatur accusantium, provident natus maxime temporibus ducimus incidunt tempora
          libero. Fuga?
        </div>`}
        .buttonText=${'Continue'}
      ></np-content-cta-modal-completion>

      <np-content-cta-selection></np-content-cta-selection>
    `
  }
}

function loadFonts() {
  const link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap')
  document.head.appendChild(link)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadFonts)
else loadFonts()

const openAppsModal = (id: string, kind: number, userPubkey: string) => {
  console.log({ id, kind, userPubkey })

  const exists = document.getElementById('apps-modal-instance') as ModalApps | null
  if (exists) {
    exists.open = true
    return
  }
  const root = document.createElement('np-content-cta-modal-apps') as ModalApps
  root.id = 'apps-modal-instance'
  root.open = true
  root.idParam = id
  root.kind = kind
  root.userPubkey = userPubkey
  root.addEventListener('close-modal', () => (root.open = false))
  document.body.appendChild(root)
}

const openLoginModal = () => {
  const exists = document.getElementById('login-modal-instance') as ModalLogin | null
  if (exists) {
    exists.open = true
    return
  }
  const root = document.createElement('np-content-cta-modal-login') as ModalLogin
  root.id = 'login-modal-instance'
  root.open = true
  root.addEventListener('close-modal', () => (root.open = false))
  document.body.appendChild(root)
}

export { openAppsModal, openLoginModal }
