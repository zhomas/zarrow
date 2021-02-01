import { activePlayerSelector, GameState } from '../game.slice'
import { CardModel } from '../types'

export const pickup = (state: GameState, ...cards: CardModel[]) => {
  const player = activePlayerSelector(state)

  cards.forEach((card) => {
    // Remove card from player
    player.cards = player.cards.filter((c) => c.card.label !== card.label)

    // Add it to the stack
    state.stack.push(card)
  })

  const toPickup = state.stack.map((c) => ({ card: c, tier: 2 }))
  player.cards = [...player.cards, ...toPickup]
  state.queue.shift()
  state.stack = []
}
