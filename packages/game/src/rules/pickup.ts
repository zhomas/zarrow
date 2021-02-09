import { createCard, createCardByID } from '../deck'
import { activePlayerSelector, GameState } from '../game.slice'
import { CardModel } from '../types'

export const pickup = (state: GameState, ...cards: CardModel[]) => {
  const player = activePlayerSelector(state)

  if (state.focused) {
    // Always add the focus card
    cards.push(createCardByID(state.focused))
  }

  cards.forEach((card) => {
    // Remove card from player
    player.cards = player.cards.filter((c) => c.card.id !== card.id)

    // Add it to the stack
    state.stack.push(card)
  })

  const toPickup = state.stack.map((c) => ({ card: c, tier: 2 }))

  player.cards = [...player.cards, ...toPickup].filter((t) => !!t)
  state.queue.shift()
  state.stack = []
  state.focused = ''
}
