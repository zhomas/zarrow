import { configureStore, Middleware } from '@reduxjs/toolkit'
import gameReducer, { GameState, initialState } from './game.slice'
export * from './game.slice'
export * from './selectors/status'

export const store = configureStore({
  reducer: gameReducer,
})

export const reducer = gameReducer

type StoreType = typeof store

export { createDeck } from './deck'
export { createGame } from './rules/create'
export type { CardModel } from './types'
export type { PlayerModel } from './types'
export type GameDispatch = StoreType['dispatch']

export const getStore = (
  preloaded: Partial<GameState>,
  ...cb: Middleware[]
) => {
  const preloadedState: GameState = { ...initialState, ...preloaded }
  return configureStore({
    reducer,
    preloadedState,
    middleware: (get) => [...get(), ...cb] as const,
  })
}

export * from './matrix'
export * from './selectors'
