import { GameState } from '..'

type PartialState = Pick<GameState, 'players'>

const playerSelector = (uid: string) => {
  return (state: PartialState) => {
    return state.players.find((p) => p.id === uid)
  }
}

export const currentTierSelector = (uid: string) => {
  const playerSelect = playerSelector(uid)
  return (state: PartialState) => {
    const player = playerSelect(state)
    const max = Math.max(...player.cards.map((c) => c.tier))
    switch (max) {
      case 1:
        return 'ups'
      case 2:
        return 'hand'
      default:
        return 'downs'
    }
  }
}

export const onTurnSelector = (uid: string) => {
  const playerSelect = playerSelector(uid)
  return (state: Pick<GameState, 'queue' | 'players'>) => {
    const player = playerSelect(state)
    return state.queue[0] === player.id
  }
}
