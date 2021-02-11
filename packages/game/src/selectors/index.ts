import { canCardPlay, GameState } from '..'
import { createCard } from '../deck'
import { getWrappedIndex } from '../utils'
export * from './mode'

export const getPlayerSelector = (id: string) => {
  return (state: GameState) => {
    return state.players.find((p) => p.id === id)
  }
}

export const shouldBurn = (state: GameState) => {
  const { stack } = state
  if (!stack.length) return false
  if (stack.find((c) => c.value === '10')) return true

  let siblings = 0
  let val = stack[0].value

  for (const card of stack) {
    if (card.value === '8') continue

    if (card.value === val) {
      siblings++
    } else {
      siblings = 0
      val = card.value
    }

    if (siblings >= 4) {
      return true
    }
  }

  // Check 8s
  let eights = 0
  for (const card of stack) {
    if (card.value === '8') {
      eights++
    } else {
      eights = 0
    }
  }

  return eights >= 4
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

export const activePlayerSelector = (state: GameState) => {
  const id = state.queue[0]
  return state.players.find((p) => p.id === id)
}

export const stackDestinationSelector = (state: GameState) => {
  for (const card of state.stack) {
    if (card.value === '8') continue
    return card
  }

  return createCard('3', 'H') // Anything can play on a 3
}

export const activeTierSelector = (state: GameState) => {
  const player = activePlayerSelector(state)
  const max = Math.max(...player.cards.map((c) => c.tier))
  return player.cards.filter((c) => c.tier === max)
}

export const mustPickUpSelector = (state: GameState) => {
  const dest = stackDestinationSelector(state)
  const options = activeTierSelector(state)
  return !options.some((c) => canCardPlay(c.card, dest))
}
