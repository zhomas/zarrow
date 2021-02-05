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

export const getDerivedState = (s: GameState) => {
  const mode = modeSelector(s)
  const prompt = promptSelector(s)
  return {
    ...s,
    players: s.players.map((p) => getResolved(getSorted(p), s)),
    focus: s.queue.length > 0 ? s.queue[0] : '',
    mode,
    prompt,
  }
}

export type DerivedGameState = ReturnType<typeof getDerivedState>
export type DerivedPlayer = DerivedGameState['players'][number]
export type DerivedCardModel = DerivedPlayer['cards'][number]
