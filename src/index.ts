import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
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
} from './utils/const'
import { ItemAction } from './utils/types'
import { Icons } from './assets/icons'
import { prepareActionsList } from './utils/helpers'
import './components'
import { ModalApps, ModalLogin } from './components'

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

  @state() actionsModalOpen = false
  @state() appsModalOpen = false
  @state() ready = false

  pluginEndpoint: any | undefined = undefined

  connectedCallback(): void {
    super.connectedCallback()
    this.id = 'np-content-cta'

    const mainAction = this.getAttribute(CTA_MAIN_ACTION_ATTR) || 'zap'
    this.mainAction = ACTIONS[mainAction]

    const actions = this.getAttribute(CTA_LIST_ATTR) || ''
    this.actions = prepareActionsList(actions, mainAction)

    this.buttonColor = this.getAttribute(BUTTON_COLOR_ATTR) || DEFAULT_BUTTON_COLOR
    this.buttonTextColor = this.getAttribute(BUTTON_TEXT_COLOR_ATTR) || DEFAULT_BUTTON_TEXT_COLOR

    waitNostrSite().then((ep) => {
      this.pluginEndpoint = ep
      this.pluginEndpoint.subscribe('action-open-with', () => {
        this._handleOpenAppsModal()
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

  private _handleCloseModal() {
    this._handleCloseActionsModal()
    this._handleCloseAppsModal()
  }

  private _handleButtonClick(type: string) {
    this.pluginEndpoint?.dispatch(`action-${type}`)

    // close the actions modal
    this.actionsModalOpen = false
  }

  renderActionsModal() {
    if (!this.actionsModalOpen || this.appsModalOpen) return nothing
    return html`
      <np-content-cta-modal @close-modal=${this._handleCloseModal} .title=${'Actions'}>
        <div class="flex flex-col gap-[8px]">
          ${this.actions.map((action) => {
            return html` <button
              @click=${() => this._handleButtonClick(action.value)}
              class="p-[8px] hover:bg-slate-50 rounded-[2px] transition-colors active:bg-slate-100 border-2 flex justify-center gap-[8px] items-center"
            >
              <div class="w-[24px] h-[24px]">${action.icon}</div>
              ${action.label}
            </button>`
          })}
        </div>
      </np-content-cta-modal>
    `
  }

  render() {
    return html`
      <div class="w-full flex flex-col gap-[8px]">
        <np-content-cta-zaps .ready=${this.ready}></np-content-cta-zaps>
        <np-content-cta-reactions .ready=${this.ready}></np-content-cta-reactions>
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
