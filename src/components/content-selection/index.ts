import { css, html, LitElement } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { TWStyles } from '../../modules/tw/twlit'
import { Icons } from '../../assets/icons'

@customElement('np-content-cta-selection')
export class ContentSelection extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    TWStyles,
  ]

  @state() selectedText = ''
  @state() debounceTimer?: number
  @query('#np-content-selection-popup') popup!: HTMLDivElement

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('mouseup', this._handleMouseUp)
    document.addEventListener('selectionchange', this._handleSelectionChange)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('mouseup', this._handleMouseUp)
    document.removeEventListener('selectionchange', this._handleSelectionChange)
  }

  private _handleMouseUp = () => {
    const selection = window.getSelection()
    if (!selection) return
    if (selection.isCollapsed) this._hidePopupMenu()
  }

  private _handleSelectionChange = () => {
    const selection = window.getSelection()
    if (!selection) return

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      let selectedNode = range.commonAncestorContainer
      if (selectedNode.nodeType !== Node.ELEMENT_NODE && selectedNode.parentNode) {
        selectedNode = selectedNode.parentNode
      }

      // @ts-ignore
      const npContent = selectedNode?.closest('np-content')
      if (!npContent) return this._hidePopupMenu()

      this.selectedText = selection.toString()
      if (this.selectedText.trim().length > 0) this._showPopupMenu(range)
      else this._hidePopupMenu()
    }
  }

  private _showPopupMenu(range: Range) {
    clearTimeout(this.debounceTimer)

    this.debounceTimer = window.setTimeout(() => {
      const popup = this.popup
      popup.style.display = 'flex'
      popup.style.visibility = 'hidden'

      const rects = range.getClientRects()
      if (rects.length === 0) {
        popup.style.display = 'none'
        return
      }

      const lastRect = rects[rects.length - 1]
      let proposedLeft = lastRect.right + window.scrollX
      let proposedTop = lastRect.bottom + window.scrollY

      requestAnimationFrame(() => {
        const popupWidth = popup.offsetWidth
        const popupHeight = popup.offsetHeight

        if (proposedLeft + popupWidth > window.innerWidth) {
          proposedLeft = window.innerWidth - popupWidth - 10
        }
        if (proposedTop + popupHeight > window.scrollY + window.innerHeight - popupWidth) {
          proposedTop = window.scrollY + lastRect.bottom - popupHeight - 10
        }
        popup.style.left = `${proposedLeft}px`
        popup.style.top = `${proposedTop}px`
        popup.style.visibility = 'visible'
        popup.style.display = 'flex'
      })
    }, 500)
  }

  private _hidePopupMenu() {
    this.popup.style.display = 'none'
  }

  private _handleQuoteText = () => {
    this.dispatchEvent(
      new CustomEvent('selection-nostr', {
        detail: { text: this.selectedText, type: 'quote' },
        bubbles: true,
        composed: true,
      })
    )
    this._hidePopupMenu()
  }

  private _handleHighlightText = () => {
    this.dispatchEvent(
      new CustomEvent('selection-nostr', {
        detail: { text: this.selectedText, type: 'highlight' },
        bubbles: true,
        composed: true,
      })
    )
    this._hidePopupMenu()
  }

  render() {
    return html`
      <div
        class="my-[2px] ml-[4px] mr-[8px] p-[12px] absolute hidden bg-white shadow-md  rounded-[10px] flex-col gap-[8px] !z-[9999999]"
        id="np-content-selection-popup"
      >
        <button
          class="p-[8px] hover:bg-slate-50 rounded-[2px] transition-colors active:bg-slate-100 border-[1px] flex justify-center gap-[8px] items-center text-[14px] text-black"
          @click="${this._handleQuoteText}"
        >
          ${Icons.Quotes} Quote
        </button>

        <button
          class="p-[8px] hover:bg-slate-50 rounded-[2px] transition-colors active:bg-slate-100 border-[1px] flex justify-center gap-[8px] items-center text-[14px] text-black"
          @click="${this._handleHighlightText}"
        >
          ${Icons.Highlight} Highlight
        </button>
      </div>
    `
  }
}
