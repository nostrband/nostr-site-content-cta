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
  @property() text = ''
  @property() publish?: (text: string) => Promise<void>
  @property() accent = ''
  @query('#np-textarea')
  textarea!: HTMLTextAreaElement

  protected firstUpdated() {
    this.textarea.value = this.text
    this.textarea.focus()
  }

  private _postMessage() {
    console.log(this.textarea.value)
    if (this.textarea.value && this.publish) {
      this._handleClose()
      this.publish(this.textarea.value)
    }
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
            class="w-full outline-none border-neutral-300 border-[1.5px] rounded-md p-2 py-3 placeholder:font-light transition-colors"
            style="${this.accent ? `border: 1px solid ${this.accent}` : ''}"
            rows="5"
            placeholder="Enter something"
            id="np-textarea"
          ></textarea>
          <button
            class="rounded-lg p-2 text-white transition-colors"
            style="${this.accent ? `background-color: ${this.accent}` : ''}"
            @click=${this._postMessage}
          >
            Post
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
