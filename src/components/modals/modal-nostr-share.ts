import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'

@customElement('np-content-cta-modal-nostr-share')
export class ModalNostrShare extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false
  @query('#np-textarea')
  textarea!: HTMLTextAreaElement

  private _getMessageValue() {
    this.textarea.value = 'Something cool'
  }

  protected firstUpdated() {
    this._getMessageValue()
  }

  private _postMessage() {
    console.log(this.textarea.value)
  }

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  render() {
    if (!this.open) return nothing
    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Share on Nostr'}>
        <div class="flex flex-col gap-[8px]">
          <textarea
            class="w-full outline-none border-neutral-300 border-[1.5px] rounded-md p-2 py-3 focus:border-violet-500 placeholder:font-light transition-colors"
            rows="5"
            placeholder="Enter something"
            id="np-textarea"
          ></textarea>
          <button
            class="bg-violet-600 rounded-lg p-2 text-white hover:bg-violet-700 active:bg-violet-800 transition-colors"
            @click=${this._postMessage}
          >
            Post on Nostr
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
