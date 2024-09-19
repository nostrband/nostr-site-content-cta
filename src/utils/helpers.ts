import { ACTIONS } from './const'
import { ItemAction } from './types'

const userRelaysCache = new Map<string, string[]>()

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

export function getAuthorRelays() {
  // @ts-ignore
  const site = window.nostrSite.renderer.getSite()
  const relays = []
  if (site.contributor_inbox_relays) relays.push(...site.contributor_inbox_relays)
  if (!relays.length && site.contributor_relays) relays.push(...site.contributor_relays)
  if (!relays.length) relays.push('wss://relay.nostr.band')
}

async function getUserRelays(pubkey: string) {
  if (!userRelaysCache.has(pubkey)) {
    // @ts-ignore
    const renderer = window.nostrSite.renderer
    const relays = await renderer.fetchOutboxRelays([pubkey])
    if (!relays.length) relays.push('wss://relay.nostr.band')
    userRelaysCache.set(pubkey, relays)
  }

  return userRelaysCache.get(pubkey)
}

async function publish(event: any) {
  // @ts-ignore
  const renderer = window.nostrSite.renderer
  return await renderer.publishEvent(event, { relays: await getUserRelays(event.pubkey) })
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

  return publish(event)
}

export async function publishNote(text: string) {
  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 1,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
  }

  return publish(event)
}

export async function publishFollow(followPubkey: string) {
  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // @ts-ignore
  const renderer = window.nostrSite.renderer

  const KIND = 3;
  const relays = await getUserRelays(pubkey)
  const contactList = await renderer.fetchEvent(
    {
      kinds: [KIND],
      authors: [pubkey],
    },
    { relays, outboxRelays: true, timeoutMs: 10000 }
  )

  const site = renderer.getSite()
  const relay =
    site.contributor_relays && site.contributor_relays.length ? site.contributor_relays[0] : 'wss://relay.nostr.band/'

  // template
  const event = {
    // defaults
    tags: [],
    content: '',
    // copy
    ...(contactList ? contactList.rawEvent() : {}),
    // ensure
    kind: KIND,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
  }
  if (!event.tags.find((t: string[]) => t.length >= 2 && t[1] === followPubkey))
    event.tags.push(['p', followPubkey, relay])

  return publish(event)
}

export async function publishBookmark() {
  const [id, addr] = getIdAddr();
  if (!id && !addr) return;

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // @ts-ignore
  const renderer = window.nostrSite.renderer

  const KIND = 10003;
  const relays = await getUserRelays(pubkey)
  const list = await renderer.fetchEvent(
    {
      kinds: [KIND],
      authors: [pubkey],
    },
    { relays, timeoutMs: 10000 }
  )

  const site = renderer.getSite()
  const relay =
    site.contributor_relays && site.contributor_relays.length ? site.contributor_relays[0] : 'wss://relay.nostr.band/'

  // template
  const event = {
    // defaults
    tags: [],
    content: '',
    // copy
    ...(list ? list.rawEvent() : {}),
    // ensure
    kind: KIND,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
  }
  if (!event.tags.find((t: string[]) => t.length >= 2 && t[1] === (id || addr))) {
    if (id) event.tags.push(['e', id, relay])
    else event.tags.push(['a', addr, relay])
  }

  return publish(event)
}
