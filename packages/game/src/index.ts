import { configureStore } from '@reduxjs/toolkit'
import gameReducer, { GameState } from './game.slice'
import { promptSelector } from './selectors/prompt'
import { modeSelector } from './selectors/status'
export * from './game.slice'

export const store = configureStore({
  reducer: gameReducer,
})

type StoreType = typeof store

export { createDeck } from './deck'
export { createGame } from './rules/create'
export type { CardModel } from './types'
export type { PlayerModel } from './types'
export type GameDispatch = StoreType['dispatch']

export const createGameStore = (s: GameState) => {
  return configureStore({
    reducer: gameReducer,
    preloadedState: s,
  })
}

export const getDerivedState = (s: GameState) => {
  const mode = modeSelector(s)
  const prompt = promptSelector(s)
  return {
    ...s,
    focus: s.queue.length > 0 ? s.queue[0] : '',
    mode,
    prompt,
  }
}

export type DerivedGameState = ReturnType<typeof getDerivedState>
