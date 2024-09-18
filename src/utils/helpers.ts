import { ACTIONS } from './const'
import { ItemAction } from './types'

export const prepareActionsList = (actions: string, mainActionKey: string) => {
  const actionsList = actions.split(',')
  const modalActions = actionsList
    .map((key) => {
      if (key === mainActionKey) return
      return ACTIONS[key]
    })
    .filter(Boolean) as ItemAction[]

  const mainAction = ACTIONS[mainActionKey]

  if (mainAction) return [mainAction, ...modalActions]
  return modalActions
}

function getMetaId() {
  const metas = document.getElementsByTagName('meta')
  // @ts-ignore
  for (const meta of metas) {
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    if (name !== 'nostr:id') continue

    const content = meta.getAttribute('content')
    if (!content) {
      console.log('Bad meta nostr:id value: ', content)
      continue
    }

    return content
  }

  return undefined
}

export function getIdAddr() {
  const eventId = getMetaId()
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
  }

  return [id, addr];
}

export function getRelays() {
  // @ts-ignore
  const site = window.nostrSite.renderer.getSite()
  const relays = []
  if (site.contributor_inbox_relays) relays.push(...site.contributor_inbox_relays)
  if (!relays.length && site.contributor_relays) relays.push(...site.contributor_relays)
  if (!relays.length) relays.push('wss://relay.nostr.band')
}