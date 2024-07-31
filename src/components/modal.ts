import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Icons } from '../assets/icons'
import { TWStyles } from '../modules/tw/twlit'

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

  private _handleCloseModal() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  private _handleBackdrop(e: Event) {
    const target = e.target as HTMLElement
    if (target.id !== 'np-content-backdrop') return
    this._handleCloseModal()
  }

  render() {
    return html`
      <div
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center"
        id="np-content-backdrop"
        @click=${this._handleBackdrop}
      >
        <div
          class="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full m-4 animate-slide-in-blurred-top"
          role="dialog"
          aria-modal="true"
          aria-labelledby="np-content-modal-title"
        >
          <button
            class="absolute top-3 right-3 p-2 hover:bg-slate-50 rounded-full transition-colors active:bg-slate-100"
            title="Close modal"
            aria-label="Close"
            @click=${this._handleCloseModal}
          >
            ${Icons.Close}
          </button>
          <h2 class="text-sm tracking-wide uppercase font-semibold mb-4 text-center" id="np-content-modal-title">
            ${this.title}
          </h2>
          <slot></slot>
        </div>
      </div>
    `
  }
}
