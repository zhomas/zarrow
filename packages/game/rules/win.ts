import { GameState } from '../game.slice'

export const winnersSelector = (state: GameState) => {
  return state.players.filter((s) => !s.cards.length).map((p) => p.id)
}

type GameStatus =
  | { status: 'running' }
  | { status: 'complete'; winners: string[] }

export const gameStatusSelector = (state: GameState): GameStatus => {
  const winners = winnersSelector(state)

  if (winners.length > 0) {
    for (const faction of state.factions) {
      if (faction.every((w) => winners.includes(w))) {
        return { status: 'complete', winners }
      }
    }
  }
  return { status: 'running' }
}
