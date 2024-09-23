import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'

@customElement('np-content-cta-modal-completion')
export class ModalCompletion extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false
  @property() title = 'Title'
  @property() text = ''
  @property() buttonText = ''
  @property() avatar = ''
  @property() userName = ''

  private _getProfilePicture(picture: string, name: string) {
    const username = name || 'User'
    if (!picture) return Icons.ProfileBig
    return html`<img alt="${username}" src="${picture}" class="rounded-full h-[48px] w-[48px]" />`
  }

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  render() {
    if (!this.open) return nothing

    return html`
      <np-content-cta-modal @close-modal=${this._handleClose}>
        <div class="flex flex-col gap-[12px] items-center">
          <span class="h-[48px] w-[48px] inline-block"> ${this._getProfilePicture(this.avatar, this.userName)} </span>
          <h1 class="font-medium text-[20px]">${this.title}</h1>
          <p class="w-full text-[14px]">${this.text}</p>
          <button
            class="w-full bg-sky-600 rounded-lg p-2 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors"
          >
            ${this.buttonText || 'Cancel'}
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
