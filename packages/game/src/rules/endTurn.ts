import _ from 'lodash'
import { activePlayerSelector, GameState } from '../game.slice'

export const endTurn = (state: GameState) => {
  const player = activePlayerSelector(state)
  const { next, pickupPile } = state

  while (
    pickupPile.length > 0 &&
    player.cards.filter((c) => c.tier === 2).length < 4
  ) {
    player.cards.push({ card: pickupPile.shift(), tier: 2 })
  }

  state.queue = [...new Set([next, ...state.queue])].filter((id) => !!id)
  state.next = ''
}
