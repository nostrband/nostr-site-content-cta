import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'

@customElement('np-content-cta-modal-loading')
export class ModalLoading extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false
  @property() title = 'Title'
  @property() loading = false

  render() {
    if (!this.open) return nothing

    return html`
      <np-content-cta-modal .title=${this.title} .closeButton=${false}>
        <np-content-cta-loading></np-content-cta-loading>
      </np-content-cta-modal>
    `
  }
}
