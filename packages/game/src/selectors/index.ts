import { canCardPlay, GameState, stackDestinationSelector } from '..'
export * from './mode'

export const getPlayerSelector = (id: string) => {
  return (state: GameState) => {
    return state.players.find((p) => p.id === id)
  }
}
