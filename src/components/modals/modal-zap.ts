import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'
import { Zap } from '../../utils/types'

@customElement('np-content-cta-modal-zap')
export class ModalZap extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false
  @property() zap?: Zap
  @property() accent = ''
  @property() dispatchZap: (amount: number) => void = () => undefined

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  private _getProfilePicture(picture: string, name: string) {
    const username = name || 'User'
    if (!picture) return Icons.ProfileBig
    return html`<img alt="${username}" src="${picture}" class="rounded-full h-[48px] w-[48px] object-cover" />`
  }

  private getSuggestedAmount() {
    return this.zap!.amount + 1;
  }

  private _handleZap() {
    this._handleClose()
    this.dispatchZap(this.getSuggestedAmount())
  }

  render() {
    if (!this.open || !this.zap) return nothing

    // @ts-ignore
    const npub = window.nostrSite.nostrTools.nip19.npubEncode(this.zap.pubkey)
    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Zap'}>
        <div class="flex flex-col gap-[16px] items-center">
          <a
            class="flex flex-col items-center gap-[8px]"
            href="https://njump.me/${npub}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="h-[48px] w-[48px] inline-block">
              ${this._getProfilePicture(this.zap.profile.picture, this.zap.profile.name)}
            </span>
            <h2 class="text-lg font-medium leading-tight text-neutral-900 truncate">${this.zap.profile.name}</h2>
          </a>
          <div class="flex justify-center items-center gap-[8px] m-1">
            <div class="flex items-center justify-center" style="width: 64px; height: 64px">
              <div class="scale-[4]">${Icons.Zap}</div>
            </div>
            <span class="text-[32px] font-medium">${this.zap.amount} sats</span>
          </div>
          ${this.zap.comment ? html` <p class="w-full text-[14px] text-center">${this.zap.comment}</p>` : nothing}
          <button
            class="w-full bg-sky-600 rounded-lg p-2 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors flex items-center gap-[8px] justify-center"
            @click=${this._handleZap}
            style="${this.accent ? `background-color: ${this.accent}` : ''}"
          >
            ${Icons.Zap} Zap ${this.getSuggestedAmount()}
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
