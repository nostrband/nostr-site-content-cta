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
