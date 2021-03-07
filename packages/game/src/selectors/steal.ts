import { activePlayerSelector, highestTierSelector } from '..'
import { GameState } from '../game.slice'
import { CardModel } from '../types'

export const myStealableCardsSelector = (uid: string) => (state: GameState) => {
  const tier = highestTierSelector(uid)(state)
  return state.players
    .find((p) => p.id === uid)
    .cards.filter((c) => c.tier === tier)
    .map((c) => c.card)
}

export const theirStealableCardsSelector = (uid: string) => (
  state: GameState,
) => {
  const target = state.activeSteal.targetID
  const id = target === uid ? activePlayerSelector(state).id : uid

  const tier = highestTierSelector(id)(state)

  return state.players
    .find((p) => p.id === id)
    .cards.filter((c) => c.tier === tier)
    .map((c) => c.card)
}

export const stealableCardsSelector = (state: GameState) => (uid: string) => {
  if (!uid) return []
  const tier = highestTierSelector(uid)(state)
  return state.players
    .find((p) => p.id === uid)
    .cards.filter((c) => c.tier === tier)
    .map((c) => c.card)
}

export const allStealableCardsSelector = (state: GameState) => {
  const st = stealableCardsSelector(state)
  const active = activePlayerSelector(state)

  if (!state.activeSteal.targetID) return []

  return [...st(active.id), ...st(state.activeSteal.targetID)]
}

export const stealableFilter = (state: GameState) => {
  const stealable = allStealableCardsSelector(state)

  return (c: CardModel) => stealable.some((st) => st.id === c.id)
}
