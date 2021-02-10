import { createSelector } from '@reduxjs/toolkit'
import { GameState, stackDestinationSelector, canCardPlay } from '..'
import { createCardByID, createDeck } from '../deck'
import { CardModel } from '../types'
import { gameModeSelector, winnersSelector } from './status'

const failedFaceDownFlip = (uid: string, state: GameState) => {
  const myCards = state.players.find((p) => p.id === uid)?.cards || []
  const max = Math.max(...myCards.map((c) => c.tier))

  const { focused } = state
  if (!!focused && max === 0) {
    const card = createCardByID(focused)
    const dest = stackDestinationSelector(state)

    console.log({ focused })

    if (!card) return false

    if (canCardPlay(card, dest)) return false

    return true
  }

  return false
}

export const userModeSelector = (uid: string) => (state: GameState) => {
  const turnActive = state.queue[0] === uid
  const myCards = state.players.find((p) => p.id === uid)?.cards || []
  const destination = stackDestinationSelector(state)
  const max = Math.max(...myCards.map((c) => c.tier))
  const canPlay = myCards
    .filter((c) => c.tier === max)
    .some((c) => canCardPlay(c.card, destination))

  const gameMode = gameModeSelector(state)

  switch (gameMode) {
    case 'complete':
      const winners = winnersSelector(state)
      return winners.includes(uid) ? 'idle:victory' : 'idle:defeat'
    default:
      if (turnActive) {
        if (!!state.idleBurn) return 'idle:burn'
        if (failedFaceDownFlip(uid, state)) return 'pickup:stack'
        if (max === 0) return 'play:downs'
        if (!canPlay) return 'pickup:stack'
        if (state.turnPhase === 'user:replenish') return 'pickup:replenish'
        if (max === 1) return 'play:ups'
        return 'play:hand'
      }

      if (myCards.length === 0) return 'idle:complete'

      return 'idle'
  }
}

type UserModeGetter = ReturnType<typeof userModeSelector>
export type UserMode = ReturnType<UserModeGetter>
