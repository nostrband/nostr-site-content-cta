import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'

const REACTIONS_MOCK_DATA = [
  {
    id: 'e1',
    icon: '🤙',
    count: 28,
  },
  {
    id: 'e2',
    icon: '❤️',
    count: 6,
  },
  {
    id: 'e3',
    icon: '🚀',
    count: 5,
  },
  {
    id: 'e1',
    icon: '🤙',
    count: 28,
  },
  {
    id: 'e2',
    icon: '❤️',
    count: 6,
  },
  {
    id: 'e3',
    icon: '🚀',
    count: 5,
  },
  {
    id: 'e1',
    icon: '🤙',
    count: 28,
  },
  {
    id: 'e2',
    icon: '❤️',
    count: 6,
  },
  {
    id: 'e3',
    icon: '🚀',
    count: 5,
  },
  {
    id: 'e4',
    icon: html`<svg viewBox="0 0 24 24" class="w-[20px] h-[20px]">
      <path
        d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      ></path>
    </svg>`,
    count: 112,
  },
]

@customElement('np-content-cta-reactions')
export class Reactions extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() reactions = REACTIONS_MOCK_DATA

  render() {
    return html`<div class="flex gap-[4px] overflow-auto scrollbar-hide">
      ${this.reactions.map((reaction) => {
        return html`<button
          title="${typeof reaction.icon === 'string' ? reaction.icon : '+'}"
          class="flex justify-center items-center gap-[8px] px-[12px] hover:bg-gray-100 h-[32px] active:bg-gray-200 rounded-[6px] min-w-[60px] text-[14px]"
        >
          <span>${reaction.icon}</span>
          <span class="text-nowrap">${reaction.count}</span>
        </button>`
      })}
    </div>`
  }
}
