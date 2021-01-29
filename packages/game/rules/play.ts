import {
  activePlayerSelector,
  GameState,
  topOfStackSelector,
} from '../game.slice'
import { canCardPlay } from '../matrix'
import { CardModel } from '../types'

export const playCard = (state: GameState, ...cards: CardModel[]) => {
  if (state.players.length < 1) return
  const destination = topOfStackSelector(state)
  const ok = cards.every((c) => canCardPlay(c, destination))

  if (ok) {
    const player = activePlayerSelector(state)

    cards.forEach((card) => {
      player.cards = player.cards.filter((c) => c.card.label !== card.label)
      state.stack.unshift(card)
    })

    const getCardsInHand = () => {
      return player.cards.filter((c) => c.tier === 2)
    }

    while (state.pickupPile.length > 0 && getCardsInHand().length < 4) {
      player.cards.push({ card: state.pickupPile.shift(), tier: 2 })
    }

    state.turnIndex += 1
  }
}
