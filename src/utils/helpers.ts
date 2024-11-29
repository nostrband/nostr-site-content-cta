import { CompletionState, ItemAction } from './types'

const userRelaysCache = new Map<string, { read: string[]; write: string[] }>()

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

// function getNostrMeta(metaNostrName: string) {
//   const metas = document.getElementsByTagName('meta')
//   // @ts-ignore
//   for (const meta of metas) {
//     const name = meta.getAttribute('name') || meta.getAttribute('property')
//     if (name !== 'nostr:' + metaNostrName) continue

//     const content = meta.getAttribute('content')
//     if (!content) {
//       console.log('Bad meta nostr:id value: ', content)
//       continue
//     }

//     return content
//   }

//   return undefined
// }

export function parseIdAddr(idAddr: string, eventId?: string) {
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

    if (!id && eventId) {
      // @ts-ignore
      const { type, data } = window.nostrSite.nostrTools.nip19.decode(eventId)
      switch (type) {
        case 'note':
          id = data
          break
        case 'nevent':
          id = data.id
          break
      }
    }
  } catch (e) {
    console.log('content-cta bad event id', idAddr)
  }
  return [id, addr]
}

// export function getIdAddr() {
//   const idAddr = getNostrMeta('id')
//   let [id, addr] = parseIdAddr(idAddr)

//   // ensure we have event id
//   if (!id) {
//     const eventId = getNostrMeta('event_id')
//     ;[id] = parseIdAddr(eventId)
//   }

//   return [id, addr]
// }

export function npubToPubkey(npub: string) {
  try {
    // @ts-ignore
    const { type, data } = window.nostrSite.nostrTools.nip19.decode(npub)
    switch (type) {
      case 'npub':
        return data
    }
  } catch (e) {
    console.log('content-cta bad npub', npub, e)
  }

  return ''
}

export async function getReadRelays({ authorPubkey, userPubkey }: { authorPubkey: string; userPubkey: string }) {
  // @ts-ignore
  const site = window.nostrSite.renderer.getSite()
  const relays = []

  // FIXME actually we might want to only read from site's relays bcs those might be
  // used for moderation... OTOH single-relay-site is a foreign concept atm
  // so not sure if we should focus on it too much.

  // reading from site's inbox
  if (site.contributor_inbox_relays) relays.push(...site.contributor_inbox_relays)
  if (!relays.length && site.contributor_relays) relays.push(...site.contributor_relays)

  // reading from author's inbox
  const authorRelays = await getUserRelays(authorPubkey)
  relays.push(...authorRelays.read)
  if (!authorRelays.read.length) relays.push(...authorRelays.write)

  // reading from user's outbox
  const userRelays = await getUserRelays(userPubkey)
  relays.push(...userRelays.write)
  if (!userRelays.write.length) relays.push(...userRelays.read)

  // fallback
  if (!relays.length) relays.push(...['wss://relay.nostr.band', 'wss://relay.damus.io', 'wss://relay.primal.net'])

  // dedup
  return [...new Set(relays)]
}

async function getWriteRelays({ authorPubkey, event }: { authorPubkey: string; event: any }) {
  // we write to the same relays that we're reading from, that's the whole point!
  return await getReadRelays({ authorPubkey, userPubkey: event.pubkey })
}

async function getUserRelays(pubkey: string) {
  if (!userRelaysCache.has(pubkey)) {
    // @ts-ignore
    const renderer = window.nostrSite.renderer
    console.log('content-cta fetch relays', pubkey)
    const relays = await renderer.fetchRelays([pubkey])
    console.log('content-cta fetched relays', pubkey, relays)
    userRelaysCache.set(pubkey, relays)
  }

  return userRelaysCache.get(pubkey)!
}

async function publish(event: any, authorPubkey: string) {
  // @ts-ignore
  const renderer = window.nostrSite.renderer
  return await renderer.publishEvent(event, {
    relays: await getWriteRelays({ event, authorPubkey }),
  })
}

function getRef() {
  return window.location.origin + window.location.pathname + window.location.search
}

function getClient() {
  return window.location.origin
}

function getTagRelay() {
  // @ts-ignore
  const renderer = window.nostrSite.renderer
  const site = renderer.getSite()
  return site.contributor_relays && site.contributor_relays.length
    ? site.contributor_relays[0]
    : 'wss://relay.nostr.band/'
}

export async function publishReaction({
  eventAddr,
  eventId,
  authorPubkey,
  emoji,
}: {
  eventAddr: string
  eventId: string
  authorPubkey: string
  emoji: string
}) {
  const [id, addr] = parseIdAddr(eventAddr, eventId)
  console.log('id', id, 'addr', addr, 'author', authorPubkey)
  if (!id && !addr) throw new Error('No id/addr')
  if (!authorPubkey) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 7,
    content: emoji,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', authorPubkey],
      ['r', getRef()],
      ['client', getClient()],
    ],
  }
  if (id) event.tags.push(['e', id, getTagRelay()])
  if (addr) event.tags.push(['a', addr, getTagRelay()])

  // custom emoji? url or data-url
  if (emoji.startsWith('http') || emoji.startsWith('data')) {
    event.content = ':custom:'
    event.tags.push(['emoji', 'custom', emoji])
  }

  return publish(event, authorPubkey)
}

export async function publishNote({ authorPubkey, text }: { authorPubkey: string; text: string }) {
  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 1,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', authorPubkey],
      ['r', getRef()],
      ['client', getClient()],
    ],
  }

  // NDK will auto-parse the nostr: links and #hashtags
  return publish(event, authorPubkey)
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

  return publish(event, followPubkey)
}

export async function publishBookmark({
  eventAddr,
  eventId,
  authorPubkey,
}: {
  eventAddr: string
  eventId: string
  authorPubkey: string
}) {
  const [id, addr] = parseIdAddr(eventAddr, eventId)
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

  return publish(event, authorPubkey)
}

export async function publishHighlight({
  eventAddr,
  eventId,
  authorPubkey,
  text,
  comment,
}: {
  eventAddr: string
  eventId: string
  authorPubkey: string
  text: string
  comment: string
}) {
  const [id, addr] = parseIdAddr(eventAddr, eventId)
  console.log('id', id, 'addr', addr, 'author', authorPubkey)
  if (!id && !addr) throw new Error('No id/addr')
  if (!authorPubkey) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 9802,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', authorPubkey],
      ['r', getRef()],
      ['client', getClient()],
    ],
  }
  if (id) event.tags.push(['e', id, getTagRelay()])
  if (addr) event.tags.push(['a', addr, getTagRelay()])

  if (comment) event.tags.push(['comment', comment])

  // NDK will auto-parse the nostr: links and #hashtags
  return publish(event, authorPubkey)
}

export async function publishReply({
  eventAddr,
  eventId,
  authorPubkey,
  text,
}: {
  eventAddr: string
  eventId: string
  authorPubkey: string
  text: string
}) {
  const [id, addr] = parseIdAddr(eventAddr, eventId)
  console.log('id', id, 'addr', addr, 'author', authorPubkey)
  if (!id && !addr) throw new Error('No id/addr')
  if (!authorPubkey) throw new Error('No author')

  // @ts-ignore
  const pubkey = await window.nostr.getPublicKey()

  // template
  const event = {
    kind: 1,
    content: text,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['p', authorPubkey],
      ['r', getRef()],
      ['client', getClient()],
    ],
  }
  if (id) event.tags.push(['e', id, getTagRelay(), 'root'])
  if (addr) event.tags.push(['a', addr, getTagRelay(), 'root'])

  return publish(event, authorPubkey)
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
