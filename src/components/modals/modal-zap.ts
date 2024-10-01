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
  @property() dispatchZap: () => void = () => undefined

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  private _getProfilePicture(picture: string, name: string) {
    const username = name || 'User'
    if (!picture) return Icons.ProfileBig
    return html`<img alt="${username}" src="${picture}" class="rounded-full h-[48px] w-[48px] object-cover" />`
  }

  private _handleZap() {
    this.dispatchZap()
  }

  render() {
    if (!this.open || !this.zap) return nothing

    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Zaps'}>
        <div class="flex flex-col gap-[16px] items-center">
          <div class="flex flex-col items-center gap-[8px]">
            <span class="h-[48px] w-[48px] inline-block">
              ${this._getProfilePicture(this.zap.profile.picture, this.zap.profile.name)}
            </span>
            <h2 class="text-lg font-medium leading-tight text-neutral-900 truncate">${this.zap.profile.name}</h2>
          </div>
          <div class="flex justify-center items-center gap-[8px]">
            <div class="h-[48px] w-[48px] flex items-center justify-center">
              <div class="scale-[2.5]">${Icons.Zap}</div>
            </div>
            <span class="text-[20px] font-medium">${this.zap.amount} zaps</span>
          </div>
          ${this.zap.comment ? html` <p class="w-full text-[14px] text-center">${this.zap.comment}</p>` : nothing}
          <button
            class="w-full bg-sky-600 rounded-lg p-2 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors"
            @click=${this._handleZap}
          >
            Zap too
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
