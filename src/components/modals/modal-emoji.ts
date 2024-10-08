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
  @property() publish?: (text: string) => Promise<void>

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  private async _handleEmojiClick(event: EmojiClickEvent) {
    if (!event.detail.unicode) return;

    this._handleClose()
    if (this.publish) this.publish(event.detail.unicode)
  }

  render() {
    if (!this.open) return nothing

    const refCallback = (element: Element | undefined) => {
      if (!element) return
      const picker = element as Picker
      picker.addEventListener('emoji-click', this._handleEmojiClick.bind(this))
    }
    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Click on emoji'}>
        <div class="flex flex-col gap-[8px]">
          <emoji-picker class="light w-full" @emoji-picker=${this._handleEmojiClick} ${ref(refCallback)}></emoji-picker>
          <p class="w-full text-[14px] text-center text-gray">Click on emoji to post your reaction</p>
        </div>
      </np-content-cta-modal>
    `
  }
}
