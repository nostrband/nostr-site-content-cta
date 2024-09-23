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
  @property() highlightText = ''
  @property() publishNote?: (text: string) => Promise<void>
  @property() publishHighlight?: (text: string) => Promise<void>
  @property() accent = ''
  @query('#np-textarea')
  textarea!: HTMLTextAreaElement

  protected firstUpdated() {
    if (this.textarea) {
      this.textarea.value = this.text
    }
  }

  private _postMessage() {
    this._handleClose()
    if (this.highlightText) {
      if (this.publishHighlight) this.publishHighlight(this.highlightText)
    } else {
      console.log(this.textarea.value)
      if (this.textarea.value && this.publishNote) {
        this.publishNote(this.textarea.value)
      }
    }
  }

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  render() {
    if (!this.open) return nothing
    return html`
      <np-content-cta-modal
        @close-modal=${this._handleClose}
        .title=${this.highlightText ? 'Highlight' : 'Share on Nostr'}
      >
        <div class="flex flex-col gap-[8px]">
          ${this.highlightText
            ? html`<blockquote>
                <p>«${this.highlightText}»</p>
              </blockquote>`
            : nothing}
          ${!this.highlightText
            ? html`
                <textarea
                  class="w-full outline-none border-neutral-300 border-[1.5px] rounded-md p-2 py-3 placeholder:font-light transition-colors"
                  style="${this.accent ? `border: 1px solid ${this.accent}` : ''}"
                  rows="5"
                  placeholder="Enter something"
                  id="np-textarea"
                >
                </textarea>
              `
            : nothing}
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
