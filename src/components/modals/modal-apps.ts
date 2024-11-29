import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'

interface App {
  id: string
  pubkey: string
  name: string
  icon: string
  url: string
  trusted: boolean
}

const GOOD_APP_PUBKEYS = [
  '20986fb83e775d96d188ca5c9df10ce6d613e0eb7e5768a0f0b12b37cdac21b3', // yakihonne
  '97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322', // hodlbod
  'a19aadee53bc71d25afef365067a3978ac30d5520d36ec8cc74d77a872af7359', // satlantis
  '460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c', // vitor
  '3356de61b39647931ce8b2140b2bab837e0810c0ef515bbe92de0248040b8bdd', // brugeman
  '73c6bb92440a9344279f7a36aa3de1710c9198b1e9e8a394cd13e0dd5c994c63', // highlighter
  'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
  '9be0be0fc079548233231614e4e1efc9f28b0db398011efeecf05fe570e5dd33', // nostur
  'e8ed3798c6ffebffa08501ac39e271662bfd160f688f94c45d692d8767dd345a', // archinox
  '7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194', // verbiricha
  '266815e0c9210dfa324c6cba3573b14bee49da4209a9456f9484e5106cd408a5', // hzrd149
  '45c41f21e1cf715fa6d9ca20b8e002a574db7bb49e96ee89834c66dac5446b7a', // flycat
  '128bc05aa6fd421d00c3c3389329f39cfc750b035db6cdad2eb0f983bff5629f', // nosta
  '126103bfddc8df256b6e0abfd7f3797c80dcc4ea88f7c2f87dd4104220b4d65f', // lume/reya
  'b7c6f6915cfa9a62fff6a1f02604de88c23c6c6c6d1b8f62c7cc10749f307e81', // florian
  '818a39b5f164235f86254b12ca586efccc1f95e98b45cb1c91c71dc5d9486dda', // nostr.band
  '63fe6318dc58583cfe16810f86dd09e18bfd76aabc24a0081ce2856f330504ed', // kieran
  '84de35e2584d2b144aae823c9ed0b0f3deda09648530b93d1a2a146d1dea9864', // snort
  '7d4e04503ab26615dd5f29ec08b52943cbe5f17bacc3012b26220caa232ab14c', // habla
]

@customElement('np-content-cta-modal-apps')
export class ModalApps extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false

  @property() userPubkey = ''
  @property() eventAddr = ''
  @property() kind: number | undefined = undefined

  @state() apps: any[] = []
  @state() isLoading = false
  @state() error = ''

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  async loadData() {
    this.error = ''
    this.isLoading = true
    try {
      const id = this.eventAddr
      if (!id) throw new Error('No nostr id')

      // @ts-ignore
      const object = await window.nostrSite.store.get(id)
      if (!object) throw new Error('No object ' + id)

      const kind = object.event.kind
      if (kind === undefined || kind < 0) throw new Error('Bad kind')

      const eventId = object.event.id

      console.log('content-cta apps for kind', kind)

      // @ts-ignore
      const events = await window.nostrSite.renderer.fetchEvents(
        {
          kinds: [31990],
          '#k': ['' + kind],
        },
        { relays: ['wss://relay.nostr.band'], timeoutMs: 2000 }
      )

      console.log('content-cta app events', events)

      const pubkeys: string[] = []
      const apps: App[] = [...events].map((ev) => {
        const urlTag = ev.tags.find((t: string[]) => {
          if (t.length < 2) return false
          if (
            t[0] !== 'web' &&
            t[0] !== 'ios' &&
            t[0] !== 'android' &&
            t[0] !== 'macos' &&
            t[0] !== 'windows' &&
            t[0] !== 'linux'
          )
            return false
          if (t.length === 2 || t[2] === '') return true
          if (kind === 0 && (t[2] === 'npub' || t[2] === 'nprofile')) return true
          if (kind === 3 || (kind >= 10000 && kind < 20000) || (kind >= 30000 && kind < 40000)) {
            if (t[2] === 'naddr') return true
          } else {
            if (t[2] === 'nevent' || t[2] === 'note') return true
          }
        })

        let url = ''
        if (urlTag) {
          let bech32 = id
          if (urlTag.length >= 3) {
            // @ts-ignore
            const { data } = window.nostrSite.nostrTools.nip19.decode(id)
            // @ts-ignore
            const relays = window.nostrSite.renderer.prepareRelays()
            // crop, otherwise nevent/nprofile/naddr becomes too large
            if (relays.length > 5) relays.length = 5
            switch (urlTag[2]) {
              case 'nprofile':
                // @ts-ignore
                bech32 = window.nostrSite.nostrTools.nip19.nprofileEncode({
                  pubkey: data,
                  relays,
                })
                break
              case 'nevent':
                // @ts-ignore
                bech32 = window.nostrSite.nostrTools.nip19.neventEncode({
                  id: eventId,
                  kind,
                  relays,
                })
                break
              case 'note':
                // @ts-ignore
                bech32 = window.nostrSite.nostrTools.nip19.noteEncode(eventId)
                break
              case 'naddr':
                // re-format naddr to add relays
                // @ts-ignore
                bech32 = window.nostrSite.nostrTools.nip19.naddrEncode({
                  pubkey: data.pubkey,
                  identifier: data.identifier,
                  kind,
                  relays,
                })
                break
            }
          }
          url = urlTag[1].replace('<bech32>', bech32)
        }
        // console.log('urlTag', urlTag, url, kind, ev)

        let profile = undefined
        try {
          profile = JSON.parse(ev.content)
        } catch {}
        if (!profile) pubkeys.push(ev.pubkey)
        return {
          id: ev.id,
          pubkey: ev.pubkey,
          name: profile ? profile.display_name || profile.name : '',
          icon: profile ? profile.picture : '',
          url,
          trusted: GOOD_APP_PUBKEYS.includes(ev.pubkey),
        }
      })

      // @ts-ignore
      const profiles = await window.nostrSite.renderer.fetchProfiles(pubkeys)
      for (const p of profiles) {
        if (!p.profile) continue
        const app = apps.find((a) => a.pubkey === p.pubkey)!
        if (!app.name) app.name = p.profile.display_name || p.profile.name
        if (!app.icon) app.icon = p.profile.picture
      }

      apps.push({
        id: 'native',
        name: 'Other native app',
        icon: '',
        pubkey: '',
        url: 'nostr:' + id,
        trusted: false,
      })

      // drop invalid, sort by trusted status
      this.apps = apps
        .filter((a) => !!a.url && !!a.name)
        .sort((a, b) => {
          if (a.trusted === b.trusted) return 0
          if (a.trusted) return -1
          return 1
        })
      console.log('content-cta apps', this.apps)

      this.isLoading = false
    } catch (e: any) {
      this.error = e.message
      this.isLoading = false
    }
  }

  updated(changedProperties: { has: (args: string) => any }) {
    if (changedProperties.has('open') && this.open) {
      this.loadData()
    }
  }

  renderContent() {
    if (this.error) {
      return html`<div class="flex justify-center items-center min-h-[10rem]">
        <h1 class="text-center">Oops... Something went wrong!</h1>
      </div>`
    }
    if (this.isLoading) {
      return html`<np-content-cta-loading></np-content-cta-loading>`
    }

    return html` <div class="flex flex-col gap-[12px] max-h-[600px] overflow-auto">
      ${this.apps.map((app) => {
        return html` <a
          href="${app.url}"
          target="_blank"
          rel="noreferrer noopener"
          class="py-[12px] px-[8px] cursor-pointer flex items-center hover:bg-neutral-100"
        >
          <div
            class="rounded-[6px] bg-neutral-200 w-[28px] h-[28px] mr-[8px] flex items-center justify-center font-bold"
          >
            ${app.icon &&
            html`<img
              src=${app.icon}
              alt=${app.name}
              @error=${(e: Event) => (e.target as HTMLElement).remove()}
              class="rounded-md"
            />`}
          </div>
          <h2 class="text-lg font-medium leading-tight text-neutral-900 truncate">${app.name}</h2>
        </a>`
      })}
    </div>`
  }

  render() {
    if (!this.open) return nothing
    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Apps'}>
        ${this.renderContent()}
      </np-content-cta-modal>
    `
  }
}
