import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'

@customElement('np-content-cta-modal')
export class Modal extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() title = ''
  @property() closeButton = true
  @query('#content-cta-dialog') dialog: HTMLDialogElement | undefined

  private _handleCloseModal() {
    this.dispatchEvent(new Event(`close-modal`))
  }
  private _handleBackdrop(e: Event) {
    if (e.target === this.dialog) this._handleCloseModal()
  }

  updated() {
    if (!this.dialog) return
    this.dialog.showModal()
  }

  render() {
    return html`
      <dialog
        class="fixed shadow-lg rounded-[8px] w-[calc(100%-32px)] max-w-[512px] m-0 left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 backdrop:bg-black backdrop:bg-opacity-50 backdrop:backdrop-blur-sm animate-slide-in-blurred-top"
        aria-modal="true"
        aria-labelledby="np-content-modal-title"
        id="content-cta-dialog"
        @close=${this._handleCloseModal}
        @click=${this._handleBackdrop}
      >
        <div class="bg-white p-[24px] w-full">
          ${this.closeButton
            ? html`<button
                class="absolute top-[8px] right-[12px] p-[8px] hover:bg-slate-50 rounded-full transition-colors active:bg-slate-100"
                title="Close modal"
                aria-label="Close"
                @click=${this._handleCloseModal}
              >
                ${Icons.Close}
              </button>`
            : nothing}
          <h2 class="text-sm tracking-wide uppercase font-semibold mb-[16px] text-center" id="np-content-modal-title">
            ${this.title}
          </h2>
          <slot></slot>
        </div>
      </dialog>
    `
  }
}
