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
  @property() reply = false
  @property() publishNote?: (text: string) => Promise<void>
  @property() publishReply?: (text: string) => Promise<void>
  @property() publishHighlight?: (text: string, comment: string) => Promise<void>
  @property() accent = ''
  @query('#np-textarea')
  textarea!: HTMLTextAreaElement

  private _postMessage() {
    this._handleClose()
    if (this.highlightText) {
      this.publishHighlight!(this.highlightText, this.textarea.value)
    } else {
      console.log(this.textarea.value)
      if (this.textarea.value) {
        if (this.reply) this.publishReply!(this.textarea.value)
        else this.publishNote!(this.textarea.value)
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
        .title=${this.highlightText ? 'Highlight' : this.reply ? 'Comment on Nostr' : 'Share on Nostr'}
      >
        <div class="flex flex-col gap-[8px]">
          ${this.highlightText
            ? html`<blockquote>
                <p>«${this.highlightText}»</p>
              </blockquote>`
            : nothing}
          <textarea
            class="w-full outline-none border-neutral-300 border-[1.5px] rounded-md p-2 py-3 placeholder:font-light transition-colors"
            style="${this.accent ? `border: 1px solid ${this.accent}` : ''}"
            rows="5"
            placeholder=${this.highlightText ? 'Optional comment' : 'Enter something'}
            id="np-textarea"
            @change=${(e: any) => (this.text = e.target.value)}
            .value=${this.text}
          ></textarea>
          <p class="w-full text-[14px] text-center text-gray">
            ${this.highlightText
              ? 'Highlight of this post will be published.'
              : this.reply
              ? 'A reply to this post will be published.'
              : 'A new thread will be started with your note.'}
          </p>
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
