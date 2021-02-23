import { canCardPlay, GameState } from '..'
import { createCard } from '../deck'
import { stackDestinationSelector } from './destination'

export * from './mode'
export * from './player'
export * from './next'
export * from './destination'

export const getPlayerSelector = (id: string) => {
  return (state: GameState) => {
    return state.players.find((p) => p.id === id)
  }
}

export type TurnLock = GameState['turnLocks'][number]

export const hasLock = (lock: TurnLock) => (s: GameState) => {
  return s.turnLocks.includes(lock)
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

export const activePlayerSelector = (state: GameState) => {
  const id = state.queue[0]
  return state.players.find((p) => p.id === id)
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
