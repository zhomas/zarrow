import {
  activePlayerSelector,
  GameState,
  stackDestinationSelector,
} from '../game.slice'
import { canCardPlay } from '../matrix'
import { CardModel } from '../types'
import { endTurn } from './endTurn'

const shouldBurn = (state: GameState) => {
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

export const playCard = (state: GameState, ...cards: CardModel[]) => {
  if (state.players.length < 1) return
  const destination = stackDestinationSelector(state)
  const ok = cards.every((c) => canCardPlay(c, destination))
  if (ok) {
    const player = activePlayerSelector(state)

    cards.forEach((card) => {
      player.cards = player.cards.filter((c) => c.card.label !== card.label)
      state.stack.unshift(card)
    })

    // Consider burn
    if (shouldBurn(state)) {
      state.burnt = [...state.stack]
      state.stack = []
    } else {
      // Consider reverse
      if (cards.length % 2 === 1 && cards.find((c) => c.value === '7')) {
        state.direction *= -1
      }
    }

    state.turnIsFresh = false
    state.focused = ''

    if (state.pickupPile.length === 0) {
      endTurn(state)
    }
  }
}
