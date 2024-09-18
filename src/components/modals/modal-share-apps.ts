import { css, html, LitElement, nothing, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'

type IShareApp = {
  id: number
  name: string
  icon: TemplateResult
}

const APPS: IShareApp[] = [
  {
    id: 1,
    name: 'Nostr',
    icon: Icons.Nostr,
  },
  {
    id: 2,
    name: 'Twitter',
    icon: Icons.TwitterX,
  },
  {
    id: 3,
    name: 'Facebook',
    icon: Icons.Facebook,
  },
  {
    id: 4,
    name: 'Reddit',
    icon: Icons.Reddit,
  },
  {
    id: 5,
    name: 'Pinterest',
    icon: Icons.Pinterest,
  },
]

@customElement('np-content-cta-modal-share-apps')
export class ModalShareApps extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false

  @state() apps: any[] = APPS
  @state() nostrShareModalOpen = false

  private _handleOpenNostrShareModal() {
    this.nostrShareModalOpen = true
  }
  private _handleCloseNostrShareModal() {
    this.nostrShareModalOpen = false
  }

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
    this._handleCloseNostrShareModal()
  }

  private _handleAppClick(app: IShareApp) {
    console.log(app)
    if (app.name === 'Nostr') {
      return this._handleOpenNostrShareModal()
    }
  }

  render() {
    if (!this.open) return nothing

    if (this.nostrShareModalOpen) {
      return html`
        <np-content-cta-modal-nostr-share
          @close-modal=${this._handleCloseNostrShareModal}
          .open=${this.nostrShareModalOpen}
        >
        </np-content-cta-modal-nostr-share>
      `
    }

    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Share with'}>
        <div class="flex flex-col gap-[8px] max-h-[600px] overflow-auto">
          ${this.apps.map((app) => {
            return html` <button
              class="py-[12px] px-[8px] cursor-pointer flex items-center hover:bg-neutral-100"
              @click=${() => this._handleAppClick(app)}
            >
              <div class="rounded-[6px] w-[28px] h-[28px] mr-[8px] flex items-center justify-center font-bold">
                ${app.icon}
              </div>
              <h2 class="text-base font-medium leading-tight text-neutral-900 truncate">${app.name}</h2>
            </button>`
          })}
        </div>
      </np-content-cta-modal>
    `
  }
}
