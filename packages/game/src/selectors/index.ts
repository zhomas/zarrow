import { canCardPlay, GameState, stackDestinationSelector } from '..'
import { getWrappedIndex } from '../utils'
export * from './mode'

export const getPlayerSelector = (id: string) => {
  return (state: GameState) => {
    return state.players.find((p) => p.id === id)
  }
}

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
