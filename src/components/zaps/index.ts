import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'

const ZAPS_MOCK_DATA = [
  {
    id: 'e1',
    count: 2800,
    profile: {
      picture: 'https://void.cat/d/LdLxqc3dPmtZboZ1NTe4HP',
      name: 'John Doe',
    },
  },
  {
    id: 'e2',
    count: 6960,
    profile: {
      picture: 'https://image.nostr.build/89ad0e9a72ff60b6c8c7dc71bb92800598c56d09cad44a4ff6b700479104811f.jpg',
      name: 'John Doe',
    },
  },
  {
    id: 'e3',
    count: 100,
    profile: {
      picture: 'https://m.primal.net/IAbB.jpg',
      name: 'John Doe',
    },
  },
]

@customElement('np-content-cta-zaps')
export class Zap extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() zaps = ZAPS_MOCK_DATA

  private prepareZapsCount(count: number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact' })
    return formatter.format(count)
  }

  private sortZaps() {
    return this.zaps.sort((a, b) => b.count - a.count)
  }

  render() {
    return html`<div class="flex gap-[4px]">
      ${this.sortZaps().map((zap) => {
        return html`<div
          class="flex items-center gap-[4px] py-[4px] ps-[8px] pe-[8px] rounded-full border-[1px] border-gray-500"
        >
          ${Icons.Zap}
          <span class="text-[14px] font-medium">${this.prepareZapsCount(zap.count)}</span>
          <span title="${zap.profile.name}">
            <img alt="${zap.profile.name}" src="${zap.profile.picture}" class="rounded-full h-[24px] w-[24px] ml-[4px]"
          /></span>
        </div>`
      })}
    </div>`
  }
}
