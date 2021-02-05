import { configureStore, Middleware } from '@reduxjs/toolkit'
import gameReducer, { GameState } from './game.slice'
import { getResolved } from './mappers/card'
import { getSorted } from './mappers/sort'
import { promptSelector } from './selectors/prompt'
import { modeSelector } from './selectors/status'
import { CardModel } from './types'
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
    middleware: [...cb],
  })
}

export const createGameStore = (s: GameState) => {
  return configureStore({
    reducer: gameReducer,
    preloadedState: s,
  })
}
