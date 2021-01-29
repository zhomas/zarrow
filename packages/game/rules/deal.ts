import { PayloadAction } from '@reduxjs/toolkit'
import { GameState } from '..'
import { CardModel, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'

interface GameInitialiser {
  factions: string[][]
  deck: CardModel[]
}

const findFreeTier = (player: PlayerModel) => {
  const downs = player.cards.filter((c) => c.tier == 0)
  const ups = player.cards.filter((c) => c.tier === 1)
  const hand = player.cards.filter((c) => c.tier === 2)

  if (downs.length < 4) return 0
  if (ups.length < 4) return 1
  return 2
}

const weave = (a: string[], b: string[]) =>
  a.length ? [a[0], ...weave(b, a.slice(1))] : b

const interweave = (...arrays: string[][]) => {
  const maxLength = Math.max(...arrays.map(({ length }) => length))

  return Array(maxLength)
    .fill(undefined)
    .reduce((acc, _, i) => {
      arrays.forEach((arr) => {
        if (arr.length - 1 >= i) {
          acc.push(arr[i])
        }
      })

      return acc
    }, [])
}

export const dealCards = (state: GameState, action: GameInitialiser) => {
  const { deck, factions } = action
  const playerIds = interweave(...factions)
  let playerIndex = 0
  const players = playerIds.map((id) => ({
    id,
    cards: [],
  }))

  while (deck.length > 0) {
    if (players.every((p) => p.cards.length === 12)) break
    const card = deck.shift()
    const i = getWrappedIndex(playerIndex, playerIds.length)
    const player = players[i]
    const target = findFreeTier(player)
    player.cards.push({ card, tier: target })
    playerIndex++
  }

  state.factions = factions
  state.players = players
  state.pickupPile = deck
  state.queue = [playerIds[0]]
  state.burnt = []
  state.stack = []
}
