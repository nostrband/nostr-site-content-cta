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

function getNostrMeta(metaNostrName: string) {
  const metas = document.getElementsByTagName('meta')
  // @ts-ignore
  for (const meta of metas) {
    const name = meta.getAttribute('name') || meta.getAttribute('property')
    if (name !== 'nostr:' + metaNostrName) continue

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
  const eventId = getNostrMeta('id')
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

  return [id, addr]
}

export function getAuthorPubkey() {
  const npub = getNostrMeta('author')
  try {
    // @ts-ignore
    const { type, data } = window.nostrSite.nostrTools.nip19.decode(npub)
    switch (type) {
      case 'npub':
        return data
    }
  } catch (e) {
    console.log('content-cta bad author', npub, e)
  }

  return ''
}

export function getRelays() {
  // @ts-ignore
  const site = window.nostrSite.renderer.getSite()
  const relays = []
  if (site.contributor_inbox_relays) relays.push(...site.contributor_inbox_relays)
  if (!relays.length && site.contributor_relays) relays.push(...site.contributor_relays)
  if (!relays.length) relays.push('wss://relay.nostr.band')
}

export async function publishReaction(emoji: string) {
  const [id, addr] = getIdAddr()
  const author = getAuthorPubkey()
  console.log('id', id, 'addr', addr, 'author', author)
  if (!id && !addr) throw new Error('No id/addr')
  if (!author) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // @ts-ignore
  const renderer = window.nostrSite.renderer
  const site = renderer.getSite()
  const relay = site.contributor_relays && site.contributor_relays.length ? site.contributor_relays[0] : ''

  // template
  const event = {
    kind: 7,
    content: emoji,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['p', author]],
  }
  if (id) event.tags.push(['e', id, relay])
  else event.tags.push(['a', addr, relay])

  await renderer.publishEvent(event)
}
