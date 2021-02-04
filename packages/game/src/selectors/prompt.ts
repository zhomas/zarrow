import {
  activePlayerSelector,
  activeTierSelector,
  GameState,
  mustPickUpSelector,
} from '../game.slice'
import { modeSelector } from './status'

type PromptLocation = 'null' | 'hand' | 'ups' | 'downs' | 'stack' | 'pickupPile'

export const promptSelector = (state: GameState): PromptLocation => {
  const mode = modeSelector(state)

  if (mode !== 'running') return 'null'

  const player = activePlayerSelector(state)
  const handCards = player.cards.filter((c) => c.tier === 2)
  const cardHasBeenPlayed = !!state.next
  const needsToReplenish = state.pickupPile.length > 0 && handCards.length < 4

  if (cardHasBeenPlayed && needsToReplenish) {
    return 'pickupPile'
  }

  if (!cardHasBeenPlayed) {
    if (mustPickUpSelector(state)) return 'stack'

    const [card] = activeTierSelector(state)
    switch (card.tier) {
      case 0:
        return 'downs'
      case 1:
        return 'ups'
      case 2:
        return 'hand'
    }
  }

  throw 'impossible'
}
