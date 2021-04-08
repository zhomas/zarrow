import { createCardByID } from '../deck'
import { GameState } from '../game.slice'
import { CardModel, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'

const findFreeTier = (player: PlayerModel) => {
  const downs = player.cards.filter((c) => c.tier == 0)
  const ups = player.cards.filter((c) => c.tier === 1)

  if (downs.length < 4) return 0
  return 2
}

interface Deck {
  cards: CardModel[]
  id: string
}

export const dealCards = (state: GameState, deck: Deck) => {
  const playerIds = state.players.map((p) => p.id)
  const { cards, id } = deck
  let playerIndex = 0
  state.players = state.players.map((p) => {
    return {
      ...p,
      cards: [],
    }
  })

  while (cards.length > 0) {
    if (state.players.every((p) => p.cards.length >= 12)) break
    const card = cards.shift()
    const i = getWrappedIndex(playerIndex, state.players.length)
    const player = state.players[i]
    const target = findFreeTier(player)
    player.cards.push({ card, tier: target })
    playerIndex++
  }

  state.dealID = id
  state.pickupPile = cards
  state.queue = [playerIds[0]]
  state.turnLocks = []
  state.burnt = []
  state.stack = []
  state.afterimage = []
  state.local = {
    targetUID: '',
    faceUpPickID: '',
  }
  state.animating = false
  state.burning = false
  state.activeSteal = {
    participants: [],
    userSteals: 0,
    reciprocatedSteals: 0,
  }
  state.pendingChains = []
  state.pregame = state.players.reduce((obj, item) => {
    return {
      ...obj,
      [item.id]: false,
    }
  }, {})
}
