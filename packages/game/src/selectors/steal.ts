import { activePlayerSelector, highestTierSelector, userModeSelector } from '..'
import { createCardByID } from '../deck'
import { GameState } from '../game.slice'
import { CardModel } from '../types'

export const stealPhaseSelector = (state: GameState) => {
  if (state.activeSteal.targeting) return 'target'

  if (
    state.activeSteal.userSteals > 0 ||
    state.activeSteal.reciprocatedSteals > 0
  ) {
    if (state.activeSteal.userSteals >= state.activeSteal.reciprocatedSteals) {
      return 'pick:cards'
    }

    return 'reciprocate'
  }

  return 'none'
}

export const myStealableCardsSelector = (uid: string) => (state: GameState) => {
  const tier = highestTierSelector(uid)(state)
  return state.players
    .find((p) => p.id === uid)
    .cards.filter((c) => c.tier === tier)
    .map((c) => c.card)
}

export const otherStealParticipantSelector = (uid: string) => (
  state: GameState,
) => {
  return state.activeSteal.participants.find((id) => id !== uid)
}

export const stealableCardsSelector = (state: GameState) => (uid: string) => {
  if (!uid) return []
  const tier = highestTierSelector(uid)(state)

  return state.players
    .find((p) => p.id === uid)
    .cards.filter((c) => c.tier === tier)
    .filter((c) => !c.stolen)
    .map((c) => c.card)
}

export const allStealableCardsSelector = (state: GameState) => {
  return []
}

export const stealableFilter = (state: GameState) => {
  const stealable = allStealableCardsSelector(state)

  return (c: CardModel) => stealable.some((st) => st.id === c.id)
}

export const stolenCardsSelector = (uid: string) => (state: GameState) => {
  return []
}
