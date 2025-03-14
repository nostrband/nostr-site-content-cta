import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { getReadRelays, parseIdAddr } from '../../utils/helpers'
import { Reaction } from '../../utils/types'

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

const REACTIONS_MOCK_DATA: Reaction[] = [
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
  @property() user = ''
  @property() author = ''
  @property() id = ''
  @property() addr = ''
  @property() accent = ''
  @property() updateTrigger = 0
  @property() reactions: Reaction[] = []
  @property() dispatchLike: (text: string) => void = () => undefined

  @query('#reactions-scroll-container') scrollContainer?: HTMLDivElement | null

  @state() since = 0
  @state() loading = false
  @state() selectedReaction: Reaction | null = null

  async loadData() {
    // @ts-ignore
    console.log(Date.now(), 'content-cta reactions starting', window.nostrSite)
    // @ts-ignore
    const nostrSite: any = window.nostrSite
    if (!nostrSite) {
      this.reactions = REACTIONS_MOCK_DATA
      return
    }

    await nostrSite.tabReady
    console.log(Date.now(), 'content-cta reactions loading')

    const [id, addr] = [this.id, this.addr]
    if (!id && !addr) return

    const filter: any = {
      kinds: [7],
      limit: 500,
      since: this.since + 1,
    }
    const filters = [];
    if (id) filters.push({ ...filter, '#e': [id] });
    if (addr) filters.push({ ...filter, '#a': [addr] });

    const relays = await getReadRelays({ authorPubkey: this.author, userPubkey: this.user });
    const events = await nostrSite.renderer.fetchEvents(filters, { relays, timeoutMs: 10000 })
    console.log(Date.now(), 'content-cta reaction events since', this.since, [...events])

    console.log('reactions user pubkey', this.user)

    const reactions: Reaction[] = [...this.reactions]
    for (const e of [...events]) {
      this.since = Math.max(this.since, e.created_at)

      const [shortcode, url] = nostrSite.utils.tvs(e, 'emoji') || ['', '']
      // console.log('shortcode, url', shortcode, url, e.id)

      let id = e.content
      let icon = id

      if (url && e.content.trim() === ':' + shortcode + ':') {
        id = url
        icon = html`<img src=${url} alt=${shortcode} height="24" width="24" />`
      } else if (!id || (/([\x00-\x7F])/.test(id) && id.length > 1)) {
        console.log('bad emoji', id, e.id)
        id = '+'
      }
      if (id === '+') icon = PLUS_REACTION
      else if (id === '-') icon = MINUS_REACTION

      const r = reactions.find((r) => r.id === id)
      if (r) {
        r.count++
        r.pubkeys!.push(e.pubkey)
      } else {
        reactions.push({
          id,
          icon,
          count: 1,
          pubkeys: [e.pubkey],
        })
      }
    }
    console.log('content-cta reactions', reactions)

    this.reactions = reactions

    this.prepareData()
  }

  prepareData() {
    if (!this.reactions.length) return

    // @ts-ignore
    const nostrSite: any = window.nostrSite

    console.log('reactions user pubkey', this.user)

    this.reactions.forEach((r) => (r.accent = Boolean(this.user && r.pubkeys && r.pubkeys.includes(this.user))))

    this.reactions.sort((a, b) => {
      if (a.accent === b.accent) return b.count - a.count
      return a.accent ? -1 : 1
    })
  }

  async updated(changedProperties: { has: (args: string) => any }) {
    if (changedProperties.has('ready') || changedProperties.has('user') || changedProperties.has('updateTrigger')) {
      if (this.ready) {
        if (this.loading) return

        this.loading = true
        try {
          await this.loadData()
        } catch {}
        this.loading = false
      }
    }
  }

  handleForceScrollSideways(event: WheelEvent) {
    event.preventDefault()
    let [x, y] = [event.deltaX, event.deltaY]
    let magnitude

    if (x === 0) {
      magnitude = y > 0 ? -30 : 30
    } else {
      magnitude = x
    }
    this.scrollContainer?.scrollBy({
      left: magnitude,
    })
  }

  firstUpdated() {
    if (this.scrollContainer) {
      this.scrollContainer.onwheel = (event) => {
        this.handleForceScrollSideways(event)
      }
    }
  }
  private _handleReactionClick(reaction: Reaction) {
    this.selectedReaction = reaction
  }

  private _handleCloseReactionModal() {
    this.selectedReaction = null
  }

  render() {
    return html` <div class="flex gap-[4px] overflow-auto scrollbar-hide" id="reactions-scroll-container">
        ${this.reactions.map((reaction) => {
          return html`<button
            title="${reaction.id}${reaction.accent ? ' - your reaction' : ''}"
            class="flex justify-center items-center gap-[8px] px-[12px] border-[1px] border-gray-300 hover:bg-gray-100 h-[32px] active:bg-gray-200 rounded-[5px] min-w-[60px] text-[14px]"
            style="${reaction.accent ? `border: 1px solid ${this.accent}` : ''}"
            @click=${() => this._handleReactionClick(reaction)}
          >
            <span class="text-nowrap">${reaction.icon}</span>
            <span class="text-nowrap">${reaction.count}</span>
          </button>`
        })}
      </div>
      <np-content-cta-modal-reaction
        .open=${!!this.selectedReaction}
        .accent=${this.accent}
        @close-modal=${this._handleCloseReactionModal}
        .reaction=${this.selectedReaction}
        .dispatchLike=${this.dispatchLike}
      >
      </np-content-cta-modal-reaction>`
  }
}
