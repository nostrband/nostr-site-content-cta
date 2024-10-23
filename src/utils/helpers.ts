import { CompletionState, ItemAction } from './types'

const userRelaysCache = new Map<string, string[]>()

export const prepareActionsList = (actions: string, ACTIONS: Record<string, ItemAction>, mainActionKey?: string) => {
  const actionsList = actions.split(',')
  const modalActions = actionsList
    .map((key) => {
      if (mainActionKey && key === mainActionKey) return
      return ACTIONS[key]
    })
    .filter(Boolean) as ItemAction[]

  if (mainActionKey) {
    const mainAction = ACTIONS[mainActionKey]
    if (mainAction) return [mainAction, ...modalActions]
  }

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

function parseIdAddr(idAddr: string) {
  let id = ''
  let addr = ''
  try {
    // @ts-ignore
    const { type, data } = window.nostrSite.nostrTools.nip19.decode(idAddr)
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
    console.log('content-cta bad event id', idAddr)
  }
  return [id, addr]
}

export function getIdAddr() {
  const idAddr = getNostrMeta('id')
  let [id, addr] = parseIdAddr(idAddr)

  // ensure we have event id
  if (!id) {
    const eventId = getNostrMeta('event_id')
    ;[id] = parseIdAddr(eventId)
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

function getRef() {
  return window.location.origin + window.location.pathname + window.location.search
}

function getTagRelay() {
  // @ts-ignore
  const renderer = window.nostrSite.renderer
  const site = renderer.getSite()
  return site.contributor_relays && site.contributor_relays.length
    ? site.contributor_relays[0]
    : 'wss://relay.nostr.band/'
}

export async function publishReaction(emoji: string) {
  const [id, addr] = getIdAddr()
  const author = getAuthorPubkey()
  console.log('id', id, 'addr', addr, 'author', author)
  if (!id && !addr) throw new Error('No id/addr')
  if (!author) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 7,
    content: emoji,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', author],
      ['r', getRef()],
    ],
  }
  if (id) event.tags.push(['e', id, getTagRelay()])
  if (addr) event.tags.push(['a', addr, getTagRelay()])

  // custom emoji? url or data-url
  if (emoji.startsWith('http') || emoji.startsWith('data')) {
    event.content = ':custom:'
    event.tags.push(['emoji', 'custom', emoji])
  }

  return publish(event)
}

export async function publishNote(text: string) {
  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()
  const author = getAuthorPubkey()

  // template
  const event = {
    kind: 1,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', author],
      ['r', getRef()],
    ],
  }

  // NDK will auto-parse the nostr: links and #hashtags
  return publish(event)
}

export async function publishFollow(followPubkey: string) {
  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // @ts-ignore
  const renderer = window.nostrSite.renderer

  const KIND = 3
  const relays = await getUserRelays(pubkey)
  const contactList = await renderer.fetchEvent(
    {
      kinds: [KIND],
      authors: [pubkey],
    },
    { relays, outboxRelays: true, timeoutMs: 10000 }
  )

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
    event.tags.push(['p', followPubkey, getTagRelay()])

  return publish(event)
}

export async function publishBookmark() {
  const [id, addr] = getIdAddr()
  if (!id && !addr) return

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // @ts-ignore
  const renderer = window.nostrSite.renderer

  const KIND = 10003
  const relays = await getUserRelays(pubkey)
  const list = await renderer.fetchEvent(
    {
      kinds: [KIND],
      authors: [pubkey],
    },
    { relays, timeoutMs: 10000 }
  )

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
    if (id) event.tags.push(['e', id, getTagRelay()])
    if (addr) event.tags.push(['a', addr, getTagRelay()])
  }

  return publish(event)
}

export async function publishHighlight(text: string, comment: string) {
  const [id, addr] = getIdAddr()
  const author = getAuthorPubkey()
  console.log('id', id, 'addr', addr, 'author', author)
  if (!id && !addr) throw new Error('No id/addr')
  if (!author) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 9802,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', author],
      ['r', getRef()],
    ],
  }
  if (id) event.tags.push(['e', id, getTagRelay()])
  if (addr) event.tags.push(['a', addr, getTagRelay()])

  if (comment) event.tags.push(['comment', comment])

  // NDK will auto-parse the nostr: links and #hashtags
  return publish(event)
}

export async function publishReply(text: string) {
  const [id, addr] = getIdAddr()
  const author = getAuthorPubkey()
  console.log('id', id, 'addr', addr, 'author', author)
  if (!id && !addr) throw new Error('No id/addr')
  if (!author) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 1,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', author],
      ['r', getRef()],
    ],
  }
  if (id) event.tags.push(['e', id, getTagRelay(), 'root'])
  if (addr) event.tags.push(['a', addr, getTagRelay(), 'root'])

  return publish(event)
}

export function getCompletionForEvent(e: any): CompletionState {
  switch (e.kind) {
    case 7:
      return 'reaction'
    case 1:
      // reply is 'note', root is 'share'
      if (e.tags.find((t: string[]) => t.length >= 4 && (t[0] === 'e' || t[0] === 'a') && t[3] === 'root'))
        return 'note'
      else return 'share'
    case 3:
      return 'follow'
    case 9802:
      return 'highlight'
    case 9735:
      return 'zap'
    case 10003:
      return 'bookmark'
  }
  return ''
}
