import { GameState } from '../game.slice'

type GameMode = 'lobby' | 'lobby:valid' | 'running' | 'complete' | 'pregame'

type PartialState = Pick<GameState, 'players' | 'burnt' | 'pregame'>

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

const inPregameSelector = (state: PartialState) => {
  if (!state.pregame) {
    return false
  }

  if (Object.keys(state.pregame).length === 0) {
    return false
  }

  const keys = Object.entries(state.pregame).filter(([k, v]) => {
    return !!v
  })

  return keys.length !== state.players.length
}

export const gameModeSelector = (state: PartialState): GameMode => {
  if (inLobbySelector(state)) {
    if (isLobbyValid(state)) return 'lobby:valid'
    return 'lobby'
  }

  if (inPregameSelector(state)) {
    return 'pregame'
  }

  const winners = winnersSelector(state)

  if (winners.length > 0) {
    return 'complete'
  }

  return 'running'
}
