export const MOCK_APPS = [
  {
    id: 'e1',
    name: 'Satlantis',
    icon: '	https://cdn.satlantis.io/logo.png',
  },
  {
    id: 'e2',
    name: '0xchat',
    icon: 'https://avatars.githubusercontent.com/u/132585693?s=200&v=4',
  },
  {
    id: 'e3',
    name: 'Creatr',
    icon: '	https://i.nostr.build/POaB8.png',
  },

  {
    id: 'e4',
    name: 'Shopstr',
    icon: 'https://cdn.nostr.build/i/548fb6eb0ce5def851fb6d0dabf0e0e31d427abc23fb10fd2ea3838724886202.png',
  },
  {
    id: 'e5',
    name: 'Battosai',
    icon: '	https://image.nostr.build/c14f326e4a7537e1f38ae340c30578af7250f14868128d1df81c6174677cc42f.png',
  },
  {
    id: 'e1',
    name: 'Satlantis',
    icon: '	https://cdn.satlantis.io/logo.png',
  },
  {
    id: 'e2',
    name: '0xchat',
    icon: 'https://avatars.githubusercontent.com/u/132585693?s=200&v=4',
  },
  {
    id: 'e3',
    name: 'Creatr',
    icon: '	https://i.nostr.build/POaB8.png',
  },

  {
    id: 'e4',
    name: 'Shopstr',
    icon: 'https://cdn.nostr.build/i/548fb6eb0ce5def851fb6d0dabf0e0e31d427abc23fb10fd2ea3838724886202.png',
  },
  {
    id: 'e5',
    name: 'Battosai',
    icon: '	https://image.nostr.build/c14f326e4a7537e1f38ae340c30578af7250f14868128d1df81c6174677cc42f.png',
  },
]

export const delay = () => {
  return new Promise<typeof MOCK_APPS>((res, rej) =>
    setTimeout(() => {
      const random = Math.floor(Math.random() * 10)
      console.log({ random })
      if (random > 5) res(MOCK_APPS)
      else rej(new Error('Error!'))
    }, 2000)
  )
}
