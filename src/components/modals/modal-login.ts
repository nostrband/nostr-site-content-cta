import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'

@customElement('np-content-cta-modal-login')
export class ModalLogin extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  render() {
    if (!this.open) return nothing
    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Introduce yourself'}>
        <div class="flex flex-col gap-3">
          <p class="max-w-[75%] m-auto text-center text-sm text-neutral-600">
            Please type your name or a pseudonym. You can change it later.
          </p>
          <input
            placeholder="Your name"
            class="w-full outline-none border-neutral-300 border-[1.5px] rounded-md p-2 py-3 focus:border-sky-600 placeholder:font-light transition-colors"
          />
          <button class="bg-sky-600 rounded-lg p-2 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors">
            Continue
          </button>
          <p class="text-center">
            Already have a Nostr account? <a href="/" class="text-sky-600 hover:text-sky-700">Login &rarr;</a>
          </p>
        </div>
      </np-content-cta-modal>
    `
  }
}
