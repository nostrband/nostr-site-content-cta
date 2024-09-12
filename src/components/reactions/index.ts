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

// const REACTIONS_MOCK_DATA = [
//   {
//     id: 'e1',
//     icon: '🤙',
//     count: 28,
//   },
//   {
//     id: 'e2',
//     icon: '❤️',
//     count: 6,
//   },
//   {
//     id: 'e3',
//     icon: '🚀',
//     count: 5,
//   },
//   {
//     id: 'e5',
//     icon: '!',
//     count: 55,
//   },
//   {
//     id: 'e6',
//     icon: '?',
//     count: 550,
//   },
//   {
//     id: 'e4',
//     icon: ,
//     count: 112,
//   },
// ]

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
    // FIXME tests
    const eventId = "note10q9f33dyh9cvsarfuyz32nr6u43smzregechp7w3efgjfs33nmusstjgtn"; //getMetaId()
    let id = ''
    let addr = ''
    try {
      // @ts-ignore
      const { type, data } = window.nostrSite.nostrTools.nip19.decode(eventId)
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

    // @ts-ignore
    const site = window.nostrSite.renderer.getSite()
    const relays = []
    if (site.contributor_inbox_relays) relays.push(...site.contributor_inbox_relays)
    if (!relays.length && site.contributor_relays) relays.push(...site.contributor_relays)
    if (!relays.length) relays.push('wss://relay.nostr.band')

    // @ts-ignore
    const events = await window.nostrSite.renderer.fetchEvents(filter, { relays: relays, timeoutMs: 5000 })

    const reactions: Reaction[] = []
    for (const e of [...events]) {
      let id = e.content
      if (!id) id = '+'
      let icon = id

      if (id === '+') icon = PLUS_REACTION
      // FIXME add MINUS

      // @ts-ignore
      const [shortcode, url] = window.nostrSite.utils.tvs(e, 'emoji') || ['', '']
      if (url && e.content.trim() === shortcode) {
        id = url
        icon = html`<img src=${url} alt=${shortcode} height="24" width="24" />`
      }

      const r = reactions.find((r) => r.id === id)
      if (r) r.count++
      else
        reactions.push({
          id,
          icon,
          count: 1,
        })
    }
    reactions.sort((a, b) => b.count - a.count);

    this.reactions = reactions;
  }

  updated(changedProperties: { has: (args: string) => any }) {
    if (changedProperties.has('ready') && this.ready) {
      this.loadData()
    }
  }

  render() {
    return html`<div class="flex gap-[4px]">
      ${this.reactions.map((reaction) => {
        return html`<button
          title="${typeof reaction.icon === 'string' ? reaction.icon : '+'}"
          class="flex justify-center items-center gap-[8px] px-[12px] hover:bg-gray-100 h-[32px] active:bg-gray-200 rounded-[6px] min-w-[32px] text-[14px]"
        >
          <span>${reaction.icon}</span>
          ${reaction.count}
        </button>`
      })}
    </div>`
  }
}
