import {
  activeTierSelector,
  getNextPlayer,
  stackDestinationSelector,
} from '../selectors'
import { lockTurn, unlockTurn } from '../game.slice'
import { CardModel } from '../types'
import { createAppThunk, playCardInternal, sleepUntil } from './common'
import { activePlayerSelector, canCardPlay } from '..'

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
      dispatch(lockTurn({ channel: 'user:replenish' }))
      await sleepUntil(() => getState().turnLocks.length === 0)
      dispatch(unlockTurn({ channel: 'user:replenish' }))
    }

    if (cards.some((c) => c.id === 'QD')) {
      console.log('QUEEEEEEEN')

      console.log(getState())
    }

    return getNextPlayer(getState(), cards, result.burn)
  },
)
