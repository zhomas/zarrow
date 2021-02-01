import { GameState } from '../game.slice'

export const createGame = (hostID: string): GameState => {
  return {
    queue: [],
    stack: [],
    burnt: [],
    direction: 1,
    pickupPile: [],
    players: [{ id: hostID, faction: -1, cards: [] }],
  }
}

export const joinGame = (state: GameState, playerID: string) => {
  state.players.push({
    id: playerID,
    faction: -1,
    cards: [],
  })
}

export const changeFaction = (
  state: GameState,
  playerID: string,
  factionID: number,
) => {
  const player = state.players.find((p) => p.id === playerID)
  player.faction = factionID
}
