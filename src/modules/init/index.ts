import { ContentSelection, ModalApps, ModalLogin } from '../../components'

function loadFonts() {
  const link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap')
  document.head.appendChild(link)
}

function init() {
  loadFonts()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()

// Handle functions
const openAppsModal = (id: string, kind: number, userPubkey: string) => {
  console.log({ id, kind, userPubkey })
  const exists = document.getElementById('apps-modal-instance') as ModalApps | null
  if (exists) {
    exists.open = true
    return
  }
  const root = document.createElement('np-content-cta-modal-apps') as ModalApps
  root.id = 'apps-modal-instance'
  root.open = true
  root.idParam = id
  root.kind = kind
  root.userPubkey = userPubkey
  root.addEventListener('close-modal', () => (root.open = false))
  document.body.appendChild(root)
}

const openLoginModal = () => {
  const exists = document.getElementById('login-modal-instance') as ModalLogin | null
  if (exists) {
    exists.open = true
    return
  }
  const root = document.createElement('np-content-cta-modal-login') as ModalLogin
  root.id = 'login-modal-instance'
  root.open = true
  root.addEventListener('close-modal', () => (root.open = false))
  document.body.appendChild(root)
}

export { openAppsModal, openLoginModal }
