import {
  activePlayerSelector,
  GameState,
  topOfStackSelector,
} from '../game.slice'
import { canCardPlay } from '../matrix'
import { CardModel, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'
import { endTurn } from './endTurn'

const getNextPlayer = (
  currentID: string,
  players: PlayerModel[],
  cards: CardModel[],
  direction: number,
) => {
  const [card, ...rest] = cards
  const dir = Math.sign(direction)

  if (players.length === 1) return currentID
  if (card.value === '10') return currentID

  let index = players.findIndex((p) => p.id === currentID) + 1 * dir

  if (card.value === '5') {
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
  console.log('1')
  if (state.players.length < 1) return
  console.log('2')
  const destination = topOfStackSelector(state)
  const ok = !state.next && cards.every((c) => canCardPlay(c, destination))
  console.log('3')
  if (ok) {
    console.log('4')
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

    state.next = getNextPlayer(player.id, state.players, cards, state.direction)

    if (state.pickupPile.length === 0) {
      endTurn(state)
    }
  }
}
