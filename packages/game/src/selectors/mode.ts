import { createSelector } from '@reduxjs/toolkit'
import { GameState, stackDestinationSelector, canCardPlay } from '..'
import { CardModel } from '../types'

const failedFaceDownFlip = (uid: string, state: GameState) => {
  const myCards = state.players.find((p) => p.id === uid)?.cards || []
  const max = Math.max(...myCards.map((c) => c.tier))

  if (state.focused && max === 0) {
    const key = `${state.focused.value}${state.focused.suit}`
    const card = state.deck[key]
    const dest = stackDestinationSelector(state)

    console.log({ key })

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

  if (turnActive) {
    if (failedFaceDownFlip(uid, state)) return 'pickup:stack'
    if (max === 0) return 'play:downs'
    if (!canPlay) return 'pickup:stack'
    if (!state.turnIsFresh) return 'pickup:replenish'
    if (max === 1) return 'play:ups'
    return 'play:hand'
  }

  return 'idle'
}
