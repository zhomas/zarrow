import { GameState } from '..'
import { createCardByID } from '../deck'
import { pickupStack, startFupu } from '../game.slice'
import { activeTierSelector, hasLock } from '../selectors'
import { CardModel } from '../types'
import { createAppThunk } from './common'

const getFUPU = (state: GameState) => {
  const activeCards = activeTierSelector(state)
  if (activeCards.some((c) => c.tier === 1)) {
    const values = new Set(activeCards.map((c) => c.card.value))
    return values.size === 1 ? 'auto' : 'user'
  }

  return 'none'
}

export const pickupThunk = createAppThunk(
  'counter/pickup:stack',
  async (_, { dispatch, getState }) => {
    const activeCards = activeTierSelector(getState())
    const fupuStyle = getFUPU(getState())
    let additions: CardModel[] = []

    switch (fupuStyle) {
      case 'user':
        dispatch(startFupu())
        const locked = hasLock('user:faceuptake')

        while (locked(getState())) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        const card = createCardByID(getState().local.faceUpPickID)
        additions = activeCards
          .filter((c) => c.card.value === card.value)
          .map((c) => c.card)
      case 'auto':
        additions = activeCards.map((c) => c.card)
      case 'none':
      default:
    }

    dispatch(pickupStack(additions))
  },
)
