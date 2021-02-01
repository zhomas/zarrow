import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './game.slice'
export * from './game.slice'

export const store = configureStore({
  reducer: gameReducer,
})

type StoreType = typeof store

export { createDeck } from './deck'
export type { PlayerModel, CardModel as Card } from './types'

export type GameDispatch = StoreType['dispatch']
export * from './rules/create'
