import { css, html, LitElement, nothing, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { APPS } from '../../utils/const'
import { IShareApp, NostrSelectionDetails } from '../../utils/types'

@customElement('np-content-cta-modal-share-apps')
export class ModalShareApps extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false
  @property() ready = false
  @property() publishNote?: (text: string) => Promise<void>
  @property() publishHighlight?: (text: string) => Promise<void>
  @property() openModal: () => void = () => undefined
  @property() accent = ''

  @state() apps: any[] = APPS
  @state() nostrText: string = ''
  @state() highlightText: string = ''
  @state() nostrShareModalOpen = false

  connectedCallback(): void {
    super.connectedCallback()
    document.addEventListener('selection-nostr', this._handleSelectionChange.bind(this) as EventListener)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    document.removeEventListener('selection-nostr', this._handleSelectionChange.bind(this) as EventListener)
  }

  private _handleSelectionChange(e: CustomEvent<NostrSelectionDetails>) {
    this.openModal()
    if (e.detail.type === 'quote') {
      this._initNostrText() // reset
      // prepend the quote
      this.nostrText = '> ' + e.detail.text + '\n' + this.nostrText
      console.log('quote', e.detail.text, this.nostrText)
      this.highlightText = '' // reset
    }
    if (e.detail.type === 'highlight') {
      this.nostrText = '' // clear, it's optional
      this.highlightText = e.detail.text
    }

    // doesn't work in sync way
    setTimeout(() => {
      this._handleClose()
      this._handleOpenNostrShareModal()
    }, 0)
  }

  private _handleOpenNostrShareModal() {
    this.nostrShareModalOpen = true
  }
  private _handleCloseNostrShareModal() {
    this.nostrShareModalOpen = false
  }

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
    this._handleCloseNostrShareModal()
  }

  private _handleAppClick(app: IShareApp) {
    console.log(app)

    this._handleClose()

    if (app.id === 'nostr') {
      this._initNostrText() // reset
      this.highlightText = '' // clear
      return this._handleOpenNostrShareModal()
    }

    // @ts-ignore
    const site = window.nostrSite.renderer.getSite()
    const title = document.querySelector('title')
    const img = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''
    const text = encodeURIComponent(title?.innerText || site.title)
    const ref = encodeURIComponent(window.location.href)
    let url = ''
    switch (app.id) {
      case 'twitter':
        // FIXME also get hashtags from post
        url = `https://twitter.com/intent/tweet?original_referer=${ref}&text=${text}&url=${ref}`
        break
      case 'facebook':
        url = `https://www.facebook.com/dialog/share?href=${ref}`
        break
      case 'reddit':
        url = `https://www.reddit.com/submit?title=${ref}`
        break
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${ref}&media=${img}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${ref}&text=${text}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${ref}`
        break
      case 'email':
        url = `mailto:?subject=${text}&body=${ref}`
        break
    }

    console.log('url', url, 'img', img)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  private _initNostrText() {
    // @ts-ignore
    const nostrSite: any = window.nostrSite
    if (!nostrSite) return

    const id = document.querySelector('meta[name="nostr:id"]')?.getAttribute('content') || ''
    const nip19 = nostrSite.nostrTools.nip19
    const renderer = nostrSite.renderer
    const site = renderer.getSite()
    const relay = site.contributor_relays && site.contributor_relays.length ? site.contributor_relays[0] : ''

    let text = id
    if (relay) {
      const { type, data } = nip19.decode(id)
      if (type === 'note') text = nip19.neventEncode({ id: data, relays: [relay] })
      else if (type === 'naddr') text = nip19.naddrEncode({ ...data, relays: [relay] })
    }
    console.log('text', text, id, relay)
    this.nostrText = `\nnostr:${text}`
  }

  render() {
    if (this.nostrShareModalOpen) {
      return html`
        <np-content-cta-modal-nostr-share
          @close-modal=${this._handleCloseNostrShareModal}
          .open=${this.nostrShareModalOpen}
          .publishNote=${this.publishNote}
          .publishHighlight=${this.publishHighlight}
          .text=${this.nostrText}
          .accent=${this.accent}
          .highlightText=${this.highlightText}
        >
        </np-content-cta-modal-nostr-share>
      `
    }

    if (!this.open) return nothing

    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Share'}>
        <div class="flex flex-col gap-[8px] max-h-[600px] overflow-auto">
          ${this.apps.map((app) => {
            return html` <button
              class="py-[12px] px-[8px] cursor-pointer flex items-center hover:bg-neutral-100"
              @click=${() => this._handleAppClick(app)}
            >
              <div class="rounded-[6px] w-[28px] h-[28px] mr-[8px] flex items-center justify-center font-bold">
                ${app.icon}
              </div>
              <h2 class="text-base font-medium leading-tight text-neutral-900 truncate">${app.name}</h2>
            </button>`
          })}
        </div>
      </np-content-cta-modal>
    `
  }
}
