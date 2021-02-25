import { GameState } from '../game.slice'
import { CardModel } from '../types'
import { getWrappedIndex } from '../utils'

export const getNextPlayer = (
  state: GameState,
  played: CardModel[],
  burnOccured: boolean,
) => {
  const currentID = state.queue[0]
  if (burnOccured) return currentID

  const dir = Math.sign(state.direction)
  const { players } = state

  const hasPlayed = (val: CardModel['value']) => {
    return played.some((c) => c.value === val)
  }

  if (players.length < 2) return currentID
  if (hasPlayed('10')) return currentID
  if (hasPlayed('A')) {
    return state.local.targetUID
  }

  let index = players.findIndex((p) => p.id === currentID) + 1 * dir

  if (hasPlayed('5')) {
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
