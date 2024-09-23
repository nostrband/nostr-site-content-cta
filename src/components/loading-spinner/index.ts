import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'

@customElement('np-content-cta-loading')
export class LoadingSpinner extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  render() {
    return html`
      <div role="status" class="flex justify-center items-center min-h-[10rem]">
        ${Icons.LoadingSpinner}
        <span class="sr-only">Loading...</span>
      </div>
    `
  }
}
