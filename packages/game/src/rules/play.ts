import {
  activePlayerSelector,
  GameState,
  stackDestinationSelector,
} from '../game.slice'
import { canCardPlay } from '../matrix'
import { CardModel } from '../types'

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

export const addToStack = (state: GameState, ...cards: CardModel[]) => {
  const player = activePlayerSelector(state)

  cards.forEach((card) => {
    player.cards = player.cards.filter((c) => c.card.id !== card.id)
    state.stack.unshift(card)
  })
}
