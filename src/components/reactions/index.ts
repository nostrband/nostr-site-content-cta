import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { getMetaId } from '../../utils/helpers'

interface Reaction {
  id: string
  icon: any
  count: number
}

const PLUS_REACTION = html`<svg viewBox="0 0 24 24" class="w-[20px] h-[20px]">
  <path
    d="M7 22V11M2 13V20C2 21.1046 2.89543 22 4 22H17.4262C18.907 22 20.1662 20.9197 20.3914 19.4562L21.4683 12.4562C21.7479 10.6389 20.3418 9 18.5032 9H15C14.4477 9 14 8.55228 14 8V4.46584C14 3.10399 12.896 2 11.5342 2C11.2093 2 10.915 2.1913 10.7831 2.48812L7.26394 10.4061C7.10344 10.7673 6.74532 11 6.35013 11H4C2.89543 11 2 11.8954 2 13Z"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  ></path>
</svg>`

const MINUS_REACTION = html`<svg viewBox="0 0 24 24" class="w-[20px] h-[20px]">
  <path
    d="M17.0001 2V13M22.0001 9.8V5.2C22.0001 4.07989 22.0001 3.51984 21.7821 3.09202C21.5903 2.71569 21.2844 2.40973 20.908 2.21799C20.4802 2 19.9202 2 18.8001 2H8.11806C6.65658 2 5.92584 2 5.33563 2.26743C4.81545 2.50314 4.37335 2.88242 4.06129 3.36072C3.70722 3.90339 3.59611 4.62564 3.37388 6.07012L2.8508 9.47012C2.5577 11.3753 2.41114 12.3279 2.69386 13.0691C2.94199 13.7197 3.4087 14.2637 4.01398 14.6079C4.70358 15 5.66739 15 7.59499 15H8.40005C8.96011 15 9.24013 15 9.45404 15.109C9.64221 15.2049 9.79519 15.3578 9.89106 15.546C10.0001 15.7599 10.0001 16.0399 10.0001 16.6V19.5342C10.0001 20.896 11.104 22 12.4659 22C12.7907 22 13.0851 21.8087 13.217 21.5119L16.5778 13.9502C16.7306 13.6062 16.807 13.4343 16.9278 13.3082C17.0346 13.1967 17.1658 13.1115 17.311 13.0592C17.4753 13 17.6635 13 18.0398 13H18.8001C19.9202 13 20.4802 13 20.908 12.782C21.2844 12.5903 21.5903 12.2843 21.7821 11.908C22.0001 11.4802 22.0001 10.9201 22.0001 9.8Z"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  ></path>
</svg>`

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
    id: 'e5',
    icon: '!',
    count: 55,
  },
  {
    id: 'e6',
    icon: '?',
    count: 550,
  },
  {
    id: 'e4',
    icon: '!',
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

  @property() ready = false
  @property() reactions: Reaction[] = []

  async loadData() {
    console.log(Date.now(), 'content-cta reactions starting')
    // @ts-ignore
    const nostrSite: any = window.nostrSite
    if (!nostrSite) {
      this.reactions = REACTIONS_MOCK_DATA
      return
    }

    await nostrSite.tabReady
    console.log(Date.now(), 'content-cta reactions loading')

    // FIXME tests
    const eventId = 'note10q9f33dyh9cvsarfuyz32nr6u43smzregechp7w3efgjfs33nmusstjgtn' //getMetaId()
    let id = ''
    let addr = ''
    try {
      const { type, data } = nostrSite.nostrTools.nip19.decode(eventId)
      switch (type) {
        case 'note':
          id = data
          break
        case 'nevent':
          id = data.id
          break
        case 'naddr':
          addr = data.kind + ':' + data.pubkey + ':' + data.identifier
          break
      }
    } catch (e) {
      console.log('content-cta bad event id', eventId)
      return
    }

    const filter: any = {
      kinds: [7],
    }
    if (id) filter['#e'] = [id]
    else filter['#a'] = [addr]

    const site = nostrSite.renderer.getSite()
    const relays = []
    if (site.contributor_inbox_relays) relays.push(...site.contributor_inbox_relays)
    if (!relays.length && site.contributor_relays) relays.push(...site.contributor_relays)
    if (!relays.length) relays.push('wss://relay.nostr.band')

    const events = await nostrSite.renderer.fetchEvents(filter, { relays: relays, timeoutMs: 5000 })
    console.log(Date.now(), 'content-cta reactions', events)

    const reactions: Reaction[] = []
    for (const e of [...events]) {
      const [shortcode, url] = nostrSite.utils.tvs(e, 'emoji') || ['', '']
      console.log('shortcode, url', shortcode, url, e.id)

      let id = e.content
      let icon = id

      if (url && e.content.trim() === ':' + shortcode + ':') {
        id = url
        icon = html`<img src=${url} alt=${shortcode} height="24" width="24" />`
      } else if (!id || id.length > 2) {
        console.log('emoji', id, id.length)
        id = '+'
      }
      if (id === '+') icon = PLUS_REACTION
      else if (id === '-') icon = MINUS_REACTION

      const r = reactions.find((r) => r.id === id)
      if (r) r.count++
      else
        reactions.push({
          id,
          icon,
          count: 1,
        })
    }
    reactions.sort((a, b) => b.count - a.count)

    this.reactions = reactions
  }

  updated(changedProperties: { has: (args: string) => any }) {
    if (changedProperties.has('ready') && this.ready) {
      this.loadData()
    }
  }

  render() {
    return html`<div class="flex gap-[4px] overflow-auto">
      ${this.reactions.map((reaction) => {
        return html`<button
          title="${typeof reaction.icon === 'string' ? reaction.icon : reaction.id}"
          class="flex justify-center items-center gap-[8px] px-[12px] hover:bg-gray-100 h-[32px] active:bg-gray-200 rounded-[6px] min-w-[60px] text-[14px]"
        >
          <span class="text-nowrap">${reaction.icon}</span>
          <span class="text-nowrap">${reaction.count}</span>
        </button>`
      })}
    </div>`
  }
}
