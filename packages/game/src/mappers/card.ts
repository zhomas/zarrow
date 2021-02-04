import { GameState, topOfStackSelector } from '../game.slice'
import { canCardPlay } from '../matrix'
import { PlayerModel } from '../types'

export const getResolved = (player: PlayerModel, state: GameState) => {
  const destination = topOfStackSelector(state)

  return {
    ...player,
    cards: player.cards.map((c) => ({
      ...c,
      canPlay: canCardPlay(c.card, destination),
    })),
  }
}
