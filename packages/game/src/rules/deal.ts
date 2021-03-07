import { createCardByID } from '../deck'
import { GameState } from '../game.slice'
import { CardModel, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'

const findFreeTier = (player: PlayerModel) => {
  const downs = player.cards.filter((c) => c.tier == 0)
  const ups = player.cards.filter((c) => c.tier === 1)

  if (downs.length < 4) return 0
  if (ups.length < 4) return 1
  return 2
}

const weave = (a: string[], b: string[]) =>
  a.length ? [a[0], ...weave(b, a.slice(1))] : b

export const dealCards = (state: GameState, deck: CardModel[]) => {
  const playerIds = state.players.map((p) => p.id)
  let playerIndex = 0
  state.players = state.players.map((p) => {
    return {
      ...p,
      cards: [],
    }
  })

  while (deck.length > 0) {
    if (state.players.every((p) => p.cards.length >= 12)) break
    const card = deck.shift()
    const i = getWrappedIndex(playerIndex, state.players.length)
    const player = state.players[i]
    const target = findFreeTier(player)
    player.cards.push({ card, tier: target })
    playerIndex++
  }

  state.pickupPile = deck
  state.queue = [playerIds[0]]
  state.turnLocks = []
  state.burnt = []
  state.stack = []
  state.turnClocks = []
  state.afterimage = []
  state.local = {
    targetUID: '',
    faceUpPickID: '',
  }

  state.activeSteal = {
    reciprocated: [],
    targetID: '',
    userSelected: [],
    count: -1,
  }
}
