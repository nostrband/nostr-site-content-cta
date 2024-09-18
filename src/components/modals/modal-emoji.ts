import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Picker } from 'emoji-picker-element'
import { EmojiClickEvent } from 'emoji-picker-element/shared'
import { ref } from 'lit/directives/ref.js'

@customElement('np-content-cta-modal-emoji')
export class ModalEmoji extends LitElement {
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

  private _handleEmojiClick(event: EmojiClickEvent) {
    console.log(event.detail)
  }

  render() {
    if (!this.open) return nothing

    const refCallback = (element: Element | undefined) => {
      if (!element) return
      const picker = element as Picker
      picker.addEventListener('emoji-click', this._handleEmojiClick)
    }
    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Choose an emoji'}>
        <div class="flex flex-col gap-[8px]">
          <emoji-picker class="light w-full" @emoji-picker=${this._handleEmojiClick} ${ref(refCallback)}></emoji-picker>
          <button
            class="w-full p-[8px] hover:bg-slate-50 rounded-[4px] transition-colors active:bg-slate-100 border-2"
            @click=${this._handleClose}
          >
            Cancel
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
