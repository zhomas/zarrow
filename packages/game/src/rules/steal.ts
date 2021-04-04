import { PayloadAction } from '@reduxjs/toolkit'
import { activePlayerSelector, GameState, highestTierSelector } from '..'
import { createCardByID } from '../deck'

export interface StealSinglePayload {
  userID: string
  cardID: string
}

export interface StealPayload {
  count: number
  targetID: string
}

export function stealSingleCard(
  state: GameState,
  action: PayloadAction<StealSinglePayload>,
) {
  const { userID, cardID } = action.payload
  const activeID = activePlayerSelector(state).id
  const reciprocal = userID !== activeID

  for (const id of state.activeSteal.participants) {
    const player = state.players.find((p) => p.id === id)

    if (id === userID) {
      player.cards.push({
        card: createCardByID(cardID),
        tier: highestTierSelector(id)(state),
        stolen: true,
      })
    } else {
      player.cards = player.cards.filter((c) => c.card.id !== cardID)
    }
  }

  if (reciprocal) {
    state.activeSteal.reciprocatedSteals--
  } else {
    state.activeSteal.userSteals--
  }

  if (
    state.activeSteal.reciprocatedSteals + state.activeSteal.userSteals ===
    0
  ) {
    state.activeSteal = {
      participants: [],
      reciprocatedSteals: 0,
      userSteals: 0,
      targeting: false,
    }
  }
}

export function selectStealTarget(
  state: GameState,
  action: PayloadAction<StealPayload>,
) {
  state.activeSteal = {
    targeting: false,
    participants: [activePlayerSelector(state).id, action.payload.targetID],
    userSteals: action.payload.count,
    reciprocatedSteals: action.payload.count,
  }
}
