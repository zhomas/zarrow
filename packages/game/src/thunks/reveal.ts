import { createAppThunk, playCardInternal } from './common'
import type { CardModel } from '../types'
import { activePlayerSelector } from '../selectors'
import { completeReveal } from '..'

interface PlayCardArgs {
  cards: CardModel[]
  playerID: string
}

export const revealThunk = createAppThunk(
  'game/psychic:reveal',
  async ({ cards, playerID }: PlayCardArgs, { dispatch, getState }) => {
    const [revealed] = cards
    const state = getState()
    const active = activePlayerSelector(state)

    if (active.id !== playerID) {
      throw new Error('Cannot reveal : not my go')
    }

    if (!state.turnLocks.includes('user:psychicreveal')) {
      throw new Error('Cannot reveal : no turn lock')
    }

    dispatch(completeReveal(revealed.id))

    await new Promise((r) => setTimeout(r, 500))

    if (revealed.value === 'Q') {
      await playCardInternal(cards, dispatch, getState)
    }
  },
)
