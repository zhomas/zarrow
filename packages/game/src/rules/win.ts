import { GameState } from '../game.slice'

export const winnersSelector = (state: GameState) => {
  return state.players.filter((s) => !s.cards.length).map((p) => p.id)
}

type GameStatus =
  | { status: 'lobby' }
  | { status: 'running' }
  | { status: 'complete'; winners: string[] }

export const gameStatusSelector = (state: GameState): GameStatus => {
  if (state.queue.length === 0) return { status: 'lobby' }

  const winners = winnersSelector(state)

  if (winners.length > 0) {
    return { status: 'complete', winners }
  }

  return { status: 'running' }
}
