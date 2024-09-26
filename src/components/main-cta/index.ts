import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'
import { DEFAULT_BUTTON_COLOR, DEFAULT_BUTTON_TEXT_COLOR, DEFAULT_MAIN_ACTION } from '../../utils/const'
import { ItemAction } from '../../utils/types'

@customElement('np-content-main-cta')
export class MainCta extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property({ attribute: false }) buttonColor = DEFAULT_BUTTON_COLOR
  @property({ attribute: false }) buttonTextColor = DEFAULT_BUTTON_TEXT_COLOR
  @property({ attribute: false }) mainAction: ItemAction = DEFAULT_MAIN_ACTION

  @query('#np-content-main-cta') mainButton!: HTMLButtonElement

  @state() inView = false

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('scroll', () => this.updateVisibility())
  }

  protected firstUpdated() {
    this.updateVisibility()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('scroll', () => this.updateVisibility())
  }

  updateVisibility() {
    if (!this.mainButton) return
    const mainButtonRect = this.mainButton.getBoundingClientRect()
    this.inView = mainButtonRect.top <= window.innerHeight
  }

  private _handleMainCtaClick() {
    this.dispatchEvent(new Event(`main-cta-click`))
  }
  private _handleDotsClick() {
    this.dispatchEvent(new Event(`dots-click`))
  }

  render() {
    return html`
      <div class="w-full flex align-middle gap-[12px]">
        <button
          class=" w-full border-2 rounded-[5px] p-[6px] hover:opacity-95 active:opacity-85 transition-opacity flex justify-center gap-[8px] items-center"
          style="background-color: ${this.buttonColor}; color: ${this.buttonTextColor}"
          @click=${this._handleMainCtaClick}
          id=${'np-content-main-cta'}
        >
          <div class="w-[24px] h-[24px]">${this.mainAction.icon}</div>
          ${this.mainAction.label}
        </button>
        <button
          class="p-[8px] hover:bg-slate-50 rounded-[5px] transition-colors active:bg-slate-100 "
          @click=${this._handleDotsClick}
        >
          ${Icons.Dots}
        </button>
      </div>

      ${this.inView
        ? nothing
        : html`<div class="fixed w-full left-0 bottom-[8px] animate-slide-in-bottom">
            <div
              class="mx-auto w-1/2 max-md:w-full max-md:px-[8px] bg-gray-50 bg-opacity-90 border-gray-100 border-[1px] p-[6px] rounded-[8px] shadow-sm"
            >
              <div class="w-full flex align-middle gap-[12px]">
                <button
                  class=" w-full border-2 rounded-[5px] p-[6px] hover:opacity-95 active:opacity-85 transition-opacity flex justify-center gap-[8px] items-center"
                  style="background-color: ${this.buttonColor}; color: ${this.buttonTextColor}"
                  @click=${this._handleMainCtaClick}
                >
                  <div class="w-[24px] h-[24px]">${this.mainAction.icon}</div>
                  ${this.mainAction.label}
                </button>
                <button
                  class="p-[8px] rounded-full bg-neutral-200 border-gray-300 border-[1px] bg-opacity-80 hover:bg-opacity-100"
                  @click=${this._handleDotsClick}
                >
                  ${Icons.Dots}
                </button>
              </div>
            </div>
          </div>`}
    `
  }
}
