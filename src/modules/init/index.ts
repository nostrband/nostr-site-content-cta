import { ContentSelection } from '../../components'

function loadFonts() {
  const link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap')
  document.head.appendChild(link)
}

function injectSelectionElement() {
  // this one must be a child of the 'body'
  const element = document.createElement('np-content-cta-selection') as ContentSelection
  if (document.body) document.body.append(element)
}

function init() {
  loadFonts()
  injectSelectionElement()
}

// no need to wait really, and if we do wait then we might
// be too late before the index.ts starts executing
// if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
// else init()
init()

// // Handle functions
// const openAppsModal = (id: string, kind: number, userPubkey: string) => {
//   console.log({ id, kind, userPubkey })
//   const exists = document.getElementById('apps-modal-instance') as ModalApps | null
//   if (exists) {
//     exists.open = true
//     return
//   }
//   const root = document.createElement('np-content-cta-modal-apps') as ModalApps
//   root.id = 'apps-modal-instance'
//   root.open = true
//   root.idParam = id
//   root.kind = kind
//   root.userPubkey = userPubkey
//   root.addEventListener('close-modal', () => (root.open = false))
//   document.body.appendChild(root)
// }

// const openLoginModal = () => {
//   const exists = document.getElementById('login-modal-instance') as ModalLogin | null
//   if (exists) {
//     exists.open = true
//     return
//   }
//   const root = document.createElement('np-content-cta-modal-login') as ModalLogin
//   root.id = 'login-modal-instance'
//   root.open = true
//   root.addEventListener('close-modal', () => (root.open = false))
//   document.body.appendChild(root)
// }

// export { openAppsModal, openLoginModal }
