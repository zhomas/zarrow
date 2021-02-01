import { GameState } from '../game.slice'
import { CardModel } from '../types'
import { playCard } from './play'

export interface PlayAce {
  cards: CardModel[]
  targetID: string
}

export const playAce = (state: GameState, play: PlayAce) => {
  const { cards, targetID } = play

  if (cards.every((c) => c.value === 'A')) {
    const q = [...state.queue]
    playCard(state, ...play.cards)
    state.queue = [targetID, ...q]
  }
}
