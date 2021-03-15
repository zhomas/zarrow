import {
  activeTierSelector,
  getNextPlayer,
  stackDestinationSelector,
} from '../selectors'
import { CardModel } from '../types'
import { createAppThunk, playCardInternal, sleepUntil } from './common'
import {
  activePlayerSelector,
  canCardPlay,
  confirmReplenish,
  startReplenish,
} from '..'

interface PlayCardArgs {
  cards: CardModel[]
  playerID: string
}

export const playCardThunk = createAppThunk(
  'counter/play:cards',
  async ({ cards, playerID }: PlayCardArgs, { dispatch, getState }) => {
    if (activePlayerSelector(getState()).id !== playerID) {
      throw new Error('Cannot play card as not player')
    }

    const destination = stackDestinationSelector(getState())
    cards = cards.filter((c) => canCardPlay(c, destination))

    if (cards.length === 0) {
      throw new Error('card cannot play')
    }

    const result = await playCardInternal(cards, dispatch, getState)

    // Replenish stack
    const tier = activeTierSelector(getState())
    const pickupRequired = getState().pickupPile.length > 0 && tier.length < 4

    if (pickupRequired) {
      dispatch(startReplenish())
      await sleepUntil(() => getState().turnLocks.length === 0)
      dispatch(confirmReplenish())
    }

    return getNextPlayer(getState(), cards, result.burn)
  },
)
