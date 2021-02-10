import { configureStore, Middleware } from '@reduxjs/toolkit'
import gameReducer, { GameState } from './game.slice'
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

export const getStore = (preloaded: GameState, ...cb: Middleware[]) => {
  return configureStore({
    reducer,
    preloadedState: preloaded,
    middleware: (get) => [...cb, ...get()],
  })
}

export * from './matrix'
export * from './selectors'

export const createGameStore = (s: GameState) => {
  return configureStore({
    reducer: gameReducer,
    preloadedState: s,
  })
}
