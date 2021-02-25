import { createCardByID } from '../deck'
import { lockTurn, pickupStack } from '../game.slice'
import { activeTierSelector, hasLock } from '../selectors'
import { CardModel } from '../types'
import { createAppThunk, sleepUntil } from './common'

export const pickupThunk = createAppThunk(
  'counter/pickup:stack',
  async (_, { dispatch, getState }) => {
    const activeCards = activeTierSelector(getState())

    let additions: CardModel[] = []

    if (activeCards.some((c) => c.tier === 1)) {
      // Face up pickup rule
      dispatch(lockTurn({ channel: 'user:faceuptake', count: 1 }))
      const locked = hasLock('user:faceuptake')

      while (locked(getState())) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const card = createCardByID(getState().local.faceUpPickID)

      additions = [
        ...additions,
        ...activeCards
          .filter((c) => c.card.value === card.value)
          .map((c) => c.card),
      ]
    }

    dispatch(pickupStack(additions))
  },
)
