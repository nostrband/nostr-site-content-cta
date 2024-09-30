import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'
import { getIdAddr, getAuthorRelays } from '../../utils/helpers'
// @ts-ignore
import { decode as decodeBolt11 } from 'light-bolt11-decoder'
import { Zap } from '../../utils/types'

const ZAPS_MOCK_DATA: Zap[] = [
  {
    id: 'e1',
    amount: 2800,
    pubkey: '',
    profile: {
      picture: '',
      name: 'John Doe',
    },
    comment: 'Some cool comment, and it is very long comment ',
  },
  {
    id: 'e2',
    amount: 6960,
    pubkey: '',
    profile: {
      picture: 'https://image.nostr.build/89ad0e9a72ff60b6c8c7dc71bb92800598c56d09cad44a4ff6b700479104811f.jpg',
      name: 'John Doe',
    },
    comment: '',
  },
  {
    id: 'e3',
    amount: 100,
    pubkey: '',
    profile: {
      picture: 'https://m.primal.net/IAbB.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e1',
    amount: 2800,
    pubkey: '',
    profile: {
      picture: 'https://void.cat/d/LdLxqc3dPmtZboZ1NTe4HP',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e2',
    amount: 6960,
    pubkey: '',
    profile: {
      picture: 'https://image.nostr.build/89ad0e9a72ff60b6c8c7dc71bb92800598c56d09cad44a4ff6b700479104811f.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e3',
    amount: 100,
    pubkey: '',
    profile: {
      picture: 'https://m.primal.net/IAbB.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e1',
    amount: 2800,
    pubkey: '',
    profile: {
      picture: 'https://void.cat/d/LdLxqc3dPmtZboZ1NTe4HP',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e2',
    amount: 6960,
    pubkey: '',
    profile: {
      picture: 'https://image.nostr.build/89ad0e9a72ff60b6c8c7dc71bb92800598c56d09cad44a4ff6b700479104811f.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e3',
    amount: 100,
    pubkey: '',
    profile: {
      picture: 'https://m.primal.net/IAbB.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e4',
    amount: 1000000,
    pubkey: '',
    profile: {
      picture: 'https://m.primal.net/IAbB.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
  {
    id: 'e5',
    amount: 1000000000,
    pubkey: '',
    profile: {
      picture: 'https://m.primal.net/IAbB.jpg',
      name: 'John Doe',
    },
    comment: 'Some cool comment',
  },
]

@customElement('np-content-cta-zaps')
export class Zaps extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        overflow: auto;
      }
    `,
    TWStyles,
  ]

  @property() ready = false
  @property() npub = ''
  @property() accent = ''
  @property() updateTrigger = 0
  @property() zaps: Zap[] = []
  @property() dispatchZap: () => void = () => undefined
  @query('#zaps-scroll-container') scrollContainer?: HTMLDivElement | null

  @state() since = 0
  @state() loading = false
  @state() selectedZap: Zap | null = null

  private prepareZapsAmount(amount: number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact' })
    return formatter.format(amount)
  }

  async loadData() {
    // @ts-ignore
    console.log(Date.now(), 'content-cta zaps starting', window.nostrSite)
    // @ts-ignore
    const nostrSite: any = window.nostrSite
    if (!nostrSite) {
      this.zaps = ZAPS_MOCK_DATA
      return
    }

    await nostrSite.tabReady
    console.log(Date.now(), 'content-cta zaps loading')

    // FIXME tests
    const [id, addr] = getIdAddr()
    if (!id && !addr) return

    const filter: any = {
      kinds: [9735],
      limit: 500,
      since: this.since + 1,
    }
    if (id) filter['#e'] = [id]
    else filter['#a'] = [addr]

    const events = await nostrSite.renderer.fetchEvents(filter, { relays: getAuthorRelays(), timeoutMs: 5000 })
    console.log(Date.now(), 'content-cta zaps', events)

    // get zap authors and amounts
    const pubkeys = new Set<string>(this.zaps.map((z) => z.pubkey))
    const zaps: Zap[] = [...this.zaps]
    for (const e of [...events]) {
      // cursor
      this.since = Math.max(this.since, e.created_at)

      let pubkey = ''
      let amount = 0
      let comment = ''
      try {
        const desc = JSON.parse(nostrSite.utils.tv(e, 'description'))
        if (desc.pubkey.length !== 64) throw new Error('Bad zap pubkey')
        pubkey = desc.pubkey
        amount = Number(nostrSite.utils.tv(desc, 'amount'))
        comment = desc.content
        if (!amount) {
          const req = decodeBolt11(nostrSite.utils.tv(e, 'bolt11'))
          amount = Number(req.sections.find((s: any) => s.name === 'amount')!.value)
        }
        amount /= 1000 // msat => sat
      } catch (err) {
        console.log('invalid zap description', e, err)
      }

      if (!pubkey || !amount) continue

      pubkeys.add(pubkey)
      zaps.push({
        id: e.id,
        amount,
        pubkey,
        profile: {
          picture: '',
          name: nostrSite.nostrTools.nip19.npubEncode(pubkey),
        },
        comment,
      })
    }

    if (pubkeys.size) {
      const profiles: any[] = await nostrSite.renderer.fetchProfiles([...pubkeys])
      console.log(Date.now(), 'content-cta zap profiles', profiles)
      for (const z of zaps) {
        const p = profiles.find((p) => p.pubkey === z.pubkey)
        if (p && p.profile) {
          z.profile.name = p.profile.display_name || p.profile.name || z.profile.name
          z.profile.picture = p.profile.picture
        }
      }
    }

    let pubkey = ''
    if (this.npub) pubkey = nostrSite.nostrTools.nip19.decode(this.npub).data
    console.log('zaps user pubkey', this.npub, pubkey)

    zaps.forEach((z) => (z.accent = z.pubkey === pubkey))

    zaps.sort((a, b) => {
      if (a.accent === b.accent) return b.amount - a.amount
      return a.accent ? -1 : 1
    })

    this.zaps = zaps
  }

  async updated(changedProperties: { has: (args: string) => any }) {
    if (changedProperties.has('ready') || changedProperties.has('npub') || changedProperties.has('updateTrigger')) {
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

  private _getProfilePicture(picture: string, name: string) {
    const username = name || 'User'
    if (!picture) return Icons.Profile
    return html`<img alt="${username}" src="${picture}" class="rounded-full h-[24px] w-[24px]" />`
  }

  private _handleZapClick(zap: Zap) {
    this.selectedZap = zap
  }

  private _handleCloseZapModal() {
    this.selectedZap = null
  }

  render() {
    return html`<div class="flex gap-[4px] overflow-auto scrollbar-hide" id="zaps-scroll-container">
        ${this.zaps.map((zap) => {
          return html`<div
            class="flex items-center gap-[8px] py-[4px] ps-[8px] pe-[8px] rounded-[5px] border-[1px] border-gray-300 hover:bg-gray-100 cursor-pointer"
            style="${zap.accent ? `border: 1px solid ${this.accent}` : ''}"
            @click=${() => this._handleZapClick(zap)}
          >
            ${Icons.Zap}
            <span class="text-[14px] font-medium text-nowrap">${this.prepareZapsAmount(zap.amount)}</span>

            <span title="${zap.profile.name}" class="h-[24px] w-[24px] inline-block">
              ${this._getProfilePicture(zap.profile.picture, zap.profile.name)}
            </span>
            <p class="text-[14px] font-medium text-nowrap max-w-[200px] overflow-hidden text-ellipsis">
              ${zap.comment}
            </p>
          </div>`
        })}
      </div>
      <np-content-cta-modal-zap
        .open=${!!this.selectedZap}
        @close-modal=${this._handleCloseZapModal}
        .zap=${this.selectedZap}
        .dispatchZap=${this.dispatchZap}
      ></np-content-cta-modal-zap> `
  }
}
