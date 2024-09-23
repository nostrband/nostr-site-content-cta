import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { LoadingState } from '../../utils/types'

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
  @property() loading: LoadingState = "";

  getTitle() {
    switch (this.loading) {
      case "bookmark": return "Posting bookmark..."
      case "follow": return "Following..."
      case "note": return "Publishing..."
      case "reaction": return "Posting your reaction..."
      case "share": return "Sharing..."
      case "highlight": return "Highlighting..."
    }
  }

  render() {
    if (!this.open) return nothing

    return html`
      <np-content-cta-modal .title=${this.getTitle()} .closeButton=${false}>
        <np-content-cta-loading></np-content-cta-loading>
      </np-content-cta-modal>
    `
  }
}
