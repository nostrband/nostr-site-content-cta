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

export function getMetaId() {
  const metas = document.getElementsByTagName("meta");
  // @ts-ignore
  for (const meta of metas) {
    const name = meta.getAttribute("name") || meta.getAttribute("property");
    if (name !== "nostr:id") continue;

    const content = meta.getAttribute("content");
    if (!content) {
      console.log("Bad meta nostr:id value: ", content);
      continue;
    }

    return content;
  }

  return undefined;
}
