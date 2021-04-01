import { configureStore, Middleware } from '@reduxjs/toolkit'
import gameReducer, { GameState, initialState } from './game.slice'
export * from './game.slice'
export * from './selectors/status'
export * from './selectors/mode'

export { createDeck } from './deck'
export { createGame } from './rules/create'
export { isHandSortedSelector } from './rules/sort'
export type { CardModel } from './types'
export type { PlayerModel } from './types'
export type GameDispatch = StoreType['dispatch']

export const getStore = (
  preloaded: Partial<GameState>,
  ...cb: Middleware[]
) => {
  const preloadedState: GameState = { ...initialState, ...preloaded }
  return configureStore({
    reducer: gameReducer,
    preloadedState,
    middleware: (get) => [...get(), ...cb] as const,
  })
}

type StoreType = ReturnType<typeof getStore>
export * from './matrix'
export * from './selectors'
export * from './utils'
export * from './thunks'
export * from './constants'
