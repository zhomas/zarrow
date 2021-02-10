import _ from 'lodash'
import { PlayerModel, CardModel } from '..'
import { activePlayerSelector, GameState } from '../game.slice'
import { getWrappedIndex } from '../utils'

export const getNextPlayer = (state: GameState) => {
  const dir = Math.sign(state.direction)
  const { players } = state
  const currentID = state.queue[0]

  if (state.stack.length === 0) {
    return currentID
  }

  if (players.length < 2) return currentID

  const topOfStack = state.stack[0]
  let index = players.findIndex((p) => p.id === currentID) + 1 * dir

  if (topOfStack.value === '5') {
    index += 1 * dir
  }

  while (true) {
    const next = getWrappedIndex(index, players.length)
    const nextPlayer = players[next]

    if (nextPlayer.cards.length > 0) {
      return nextPlayer.id
    }

    index += 1 * dir
  }
}

export const endTurn = (state: GameState) => {
  const player = activePlayerSelector(state)
  const { pickupPile } = state

  while (
    pickupPile.length > 0 &&
    player.cards.filter((c) => c.tier === 2).length < 4
  ) {
    player.cards.push({ card: pickupPile.shift(), tier: 2 })
  }
}
