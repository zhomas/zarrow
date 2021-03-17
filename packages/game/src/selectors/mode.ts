import {
  GameState,
  stackDestinationSelector,
  canCardPlay,
  hasLock,
  stealPhaseSelector,
} from '..'
import { createCardByID } from '../deck'
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

  const isBurning = (st: GameState) => !!st.burning
  const isAnimating = (st: GameState) => !!st.animating
  const isAcing = hasLock('user:target')
  const isReplenishing = hasLock('user:replenish')
  const isRevealing = hasLock('user:psychicreveal')
  const isStealTarget = stealPhaseSelector(state) === 'target'
  const isStealPick = stealPhaseSelector(state) === 'pick:cards'
  const isStealReciprocate = stealPhaseSelector(state) === 'reciprocate'

  if (isBurning(state)) return 'idle:burn'

  switch (gameMode) {
    case 'complete':
      const winners = winnersSelector(state)
      return winners.includes(uid) ? 'idle:victory' : 'idle:defeat'
    default:
      if (turnActive) {
        if (isAcing(state)) return 'play:target'
        if (isRevealing(state)) return 'play:reveal'
        if (isStealTarget) return 'play:target'
        if (isStealPick) return 'steal:pick'
        if (isStealReciprocate) return 'steal:receive'

        if (isAnimating(state)) {
          if (max === 2) return 'play:hand'
          if (max === 1) return 'play:ups'
          if (max === 0) return 'play:downs'
        }

        if (failedFaceDownFlip(uid, state)) return 'pickup:stack'
        if (max === 0) return 'play:downs'
        if (isReplenishing(state)) return 'pickup:replenish'
        if (!canPlay) return 'pickup:stack'
        if (max === 1) return 'play:ups'
        return 'play:hand'
      }

      if (state.activeSteal.participants.includes(uid)) {
        if (isStealReciprocate) return 'steal:pick'
        return 'steal:receive'
      }

      if (myCards.length === 0) return 'idle:complete'

      return 'idle'
  }
}

type HighlightLocation =
  | 'none'
  | 'replenish'
  | 'stack'
  | 'hand'
  | ['playerID', string]

export const highlightedLocationSelector = (uid: string) => {
  const selectMode = userModeSelector(uid)

  return (state: GameState): HighlightLocation => {
    const mode = selectMode(state)
    const active = state.queue[0]

    if (active === uid) {
      if (mode === 'play:reveal') return ['playerID', uid]
      if (mode === 'play:target') return 'none'
      if (mode === 'idle:burn') return 'none'
      if (mode === 'pickup:stack') return 'stack'
      if (mode === 'pickup:replenish') return 'replenish'
      if (mode === 'play:hand') return 'hand'

      return ['playerID', uid]
    }

    return ['playerID', active]
  }
}

type UserModeGetter = ReturnType<typeof userModeSelector>
export type UserMode = ReturnType<UserModeGetter>
