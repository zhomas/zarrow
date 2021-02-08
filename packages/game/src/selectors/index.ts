import { canCardPlay, GameState, stackDestinationSelector } from '..'

export const getPlayerSelector = (id: string) => {
  return (state: GameState) => {
    return state.players.find((p) => p.id === id)
  }
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
    if (!canPlay) return 'pickupStack'
    if (!state.turnIsFresh) return 'replenish'

    if (max === 0) return 'play:downs'
    if (max === 1) return 'play:ups'
    return 'play:hand'
  }

  return 'idle'
}
