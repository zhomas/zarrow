import { GameState } from '../game.slice'

type GameMode = 'lobby' | 'lobby:valid' | 'running' | 'complete'

type PartialState = Pick<GameState, 'players' | 'burnt'>

export const winnersSelector = (state: PartialState) => {
  return state.players.filter((s) => !s.cards.length).map((p) => p.id)
}

const inLobbySelector = (state: PartialState) => {
  if (state.players.find((p) => p.cards.length > 0)) return false
  if (state.burnt.length > 0) return false

  return true
}

const isLobbyValid = (state: PartialState) => {
  if (state.players.length < 2) return false
  if (state.players.find((p) => p.faction < 0)) return false
  if (state.players.every((p) => p.faction === 0)) return false
  if (state.players.every((p) => p.faction === 1)) return false

  return true
}

export const gameModeSelector = (state: PartialState): GameMode => {
  if (inLobbySelector(state)) {
    if (isLobbyValid(state)) return 'lobby:valid'
    return 'lobby'
  }

  const winners = winnersSelector(state)

  if (winners.length > 0) {
    return 'complete'
  }

  return 'running'
}
