import { GameState } from '../game.slice'

export const createGame = (): Required<GameState> => {
  return {
    queue: [],
    stack: [],
    burnt: [],
    direction: 1,
    pickupPile: [],
    players: [],
    turnLocks: [],
    afterimage: [],
    local: {
      faceUpPickID: '',
      targetUID: '',
    },
    activeSteal: {
      userSteals: 0,
      reciprocatedSteals: 0,
      participants: [],
    },
    pendingChains: [],
    dealID: '',
    burning: false,
    animating: false,
    stackEffect: '',
    chainIt: {
      show: false,
      value: false,
    },
    focused: '',
    pregame: {},
  }
}

export const joinGame = (state: GameState, playerID: string, name: string) => {
  if (state.players.find((p) => p.id === playerID)) return

  state.players.push({
    id: playerID,
    displayName: name,
    faction: 0,
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
