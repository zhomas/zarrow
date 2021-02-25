import { unlockTurn } from '../game.slice'
import { applyClock, createAppThunk, playCardInternal } from './common'
import type { CardModel } from '../types'
import { activePlayerSelector } from '../selectors'

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

    dispatch(unlockTurn({ channel: 'user:psychicreveal', data: revealed.id }))

    await new Promise((r) => setTimeout(r, 500))

    if (revealed.value === 'Q') {
      dispatch(applyClock('chainedqueen'))
      await playCardInternal(cards, dispatch, getState)
    }
  },
)
