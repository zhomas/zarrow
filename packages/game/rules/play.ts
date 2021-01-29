import {
  activePlayerSelector,
  GameState,
  topOfStackSelector,
} from '../game.slice'
import { canCardPlay } from '../matrix'
import { CardModel, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'

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
  if (state.players.length < 1) return
  const destination = topOfStackSelector(state)
  const ok = cards.every((c) => canCardPlay(c, destination))

  if (ok) {
    const player = activePlayerSelector(state)
    const [card] = cards

    cards.forEach((card) => {
      player.cards = player.cards.filter((c) => c.card.label !== card.label)
      state.stack.unshift(card)
    })

    // Consider burn
    if (shouldBurn(state)) {
      state.burnt = [...state.stack]
      state.stack = []
    }

    // Consider reverse
    if (cards.length % 2 === 1 && cards.find((c) => c.value === '7')) {
      state.direction *= -1
    }

    while (
      state.pickupPile.length > 0 &&
      player.cards.filter((c) => c.tier === 2).length < 4
    ) {
      player.cards.push({ card: state.pickupPile.shift(), tier: 2 })
    }

    const next = getNextPlayer(player.id, state.players, cards, state.direction)
    state.queue.unshift(next)
  }
}
