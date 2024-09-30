import { css, html, LitElement, nothing, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Reaction } from '../../utils/types'
import { Icons } from '../../assets/icons'

@customElement('np-content-cta-modal-reaction')
export class ModalReaction extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @property() open = false
  @property() reaction?: Reaction

  @state() loading = false
  @state() profiles: any[] = []

  private _handleClose() {
    this.dispatchEvent(new Event(`close-modal`))
  }

  async loadData() {
    if (!this.reaction) return

    // @ts-ignore
    const nostrSite: any = window.nostrSite
    const pubkeys = this.reaction.pubkeys || []
    const profiles: any[] = await nostrSite.renderer.fetchProfiles([...pubkeys])
    this.profiles = profiles
  }

  async updated(changedProperties: { has: (args: string) => any }) {
    if (changedProperties.has('reaction') && this.reaction) {
      try {
        this.loading = true
        await this.loadData()
        this.loading = false
      } catch {
        this.loading = false
      }
    }
  }

  private _getProfilePicture(picture: string, name: string) {
    const username = name || 'User'
    if (!picture) return Icons.Profile
    return html`<img alt="${username}" src="${picture}" class="rounded-full h-[24px] w-[24px]" />`
  }

  private _handlePostReaction() {}

  render() {
    if (!this.open || !this.reaction) return nothing

    return html`
      <np-content-cta-modal @close-modal=${this._handleClose} .title=${'Reactions'}>
        <div class="flex flex-col gap-[16px]">
          <div class="w-[80px] h-[80px] mx-auto flex items-center justify-center">
            <div class="scale-[4]">${this.reaction.icon}</div>
          </div>
          ${this.profiles.length
            ? html` <div class="flex flex-col gap-[4px] items-center">
                <p class="text-[15px]">Users:</p>
                <div class="flex flex-col gap-[8px] max-h-[400px] overflow-auto w-full">
                  ${this.profiles.map((profile) => {
                    return html`<div
                      class="flex items-center gap-[8px] p-[8px] rounded-[5px] bg-gray-50 hover:bg-gray-100"
                    >
                      <span title="${profile.name}" class="h-[24px] w-[24px] inline-block">
                        ${this._getProfilePicture(profile.picture, profile.name)}
                      </span>
                      <h2 class="text-lg font-medium leading-tight text-neutral-900 truncate">${profile.name}</h2>
                    </div>`
                  })}
                </div>
              </div>`
            : html`<div class="flex items-center justify-center">${Icons.LoadingSpinner}</div>`}
          <button
            class="w-full bg-sky-600 rounded-lg p-2 text-white hover:bg-sky-700 active:bg-sky-800 transition-colors"
            @click=${this._handlePostReaction}
          >
            Post ${this.reaction.icon} reaction
          </button>
        </div>
      </np-content-cta-modal>
    `
  }
}
