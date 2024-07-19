import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from './modules/tw/twlit'
import {
  ACTIONS,
  BUTTON_COLOR_ATTR,
  CTA_LIST_ATTR,
  CTA_MAIN_ACTION_ATTR,
  DEFAULT_BUTTON_COLOR,
  DEFAULT_MAIN_ACTION,
} from './utils/const'
import { ItemAction } from './utils/types'
import { Icons } from './assets/icons'
import { prepareActionsList } from './utils/helpers'

@customElement('np-content-cta')
export class MyComponent extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property({ attribute: false }) buttonColor = DEFAULT_BUTTON_COLOR
  @property({ attribute: false }) actions: ItemAction[] = []
  @property({ attribute: false }) mainAction: ItemAction = DEFAULT_MAIN_ACTION

  @state() open = false

  connectedCallback(): void {
    super.connectedCallback()

    const mainAction = this.getAttribute(CTA_MAIN_ACTION_ATTR) || 'zap'
    this.mainAction = ACTIONS[mainAction]

    const actions = this.getAttribute(CTA_LIST_ATTR) || ''
    this.actions = prepareActionsList(actions, mainAction)

    this.buttonColor = this.getAttribute(BUTTON_COLOR_ATTR) || DEFAULT_BUTTON_COLOR
  }

  private _handleOpenModal() {
    this.open = true
  }

  private _handleCloseModal() {
    this.open = false
  }

  private _handleBackdrop(e: Event) {
    const target = e.target as HTMLElement
    if (target.id !== 'np-content-backdrop') return
    this._handleCloseModal()
  }

  private _handleButtonClick(type: string) {
    document.dispatchEvent(new Event(`np-content-cta-${type}`))
  }

  renderModal() {
    if (!this.open) return nothing
    return html`
      <div
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center"
        @click=${this._handleBackdrop}
        id="np-content-backdrop"
      >
        <div
          class="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full m-4 animate-slide-in-blurred-top"
          role="dialog"
          aria-modal="true"
          aria-labelledby="np-content-modal-title"
        >
          <button
            class="absolute top-3 right-3 p-2 hover:bg-slate-50 rounded-full transition-colors active:bg-slate-100"
            @click=${this._handleCloseModal}
            title="Close modal"
            aria-label="Close"
          >
            ${Icons.Close}
          </button>

          <h2 class="text-sm tracking-wide uppercase font-semibold mb-4 text-center" id="np-content-modal-title">
            Actions
          </h2>

          <div class="flex flex-col gap-2">
            ${this.actions.map((action) => {
              return html` <button
                @click=${() => this._handleButtonClick(action.value)}
                class="p-2 hover:bg-slate-50 rounded-sm transition-colors active:bg-slate-100 border-2 flex justify-center gap-2"
              >
                <div>${action.icon}</div>
                ${action.label}
              </button>`
            })}
          </div>
        </div>
      </div>
    `
  }

  render() {
    return html`<div class="w-full flex align-middle gap-3">
        <button
          class="text-white w-full border-2 rounded-[5px] p-[6px] hover:opacity-95 active:opacity-85 transition-opacity flex justify-center gap-2"
          style="background-color: ${this.buttonColor}"
          @click=${() => this._handleButtonClick(this.mainAction.value)}
        >
          <div>${this.mainAction.icon}</div>
          ${this.mainAction.label}
        </button>
        <button
          class="p-2 hover:bg-slate-50 rounded-full transition-colors active:bg-slate-100"
          @click=${this._handleOpenModal}
        >
          ${Icons.Dots}
        </button>
      </div>

      <div id="content-cta-modal-root">${this.renderModal()}</div> `
  }
}
