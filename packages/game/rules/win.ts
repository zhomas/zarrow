import { GameState } from '../game.slice'

export const winnersSelector = (state: GameState) => {
  return state.players.filter((s) => !s.cards.length).map((p) => p.id)
}
