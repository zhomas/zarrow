import { PayloadAction } from '@reduxjs/toolkit'
import { GameState } from '../game.slice'
import { modeSelector } from '../selectors/status'
import { CardModel, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'

interface GameInitialiser {
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

export const dealCards = (state: GameState, deck: CardModel[]) => {
  const mode = modeSelector(state)

  if (mode !== 'lobby:valid') return

  const playerIds = state.players.map((p) => p.id)
  let playerIndex = 0

  while (deck.length > 0) {
    if (state.players.every((p) => p.cards.length === 12)) break
    const card = deck.shift()
    const i = getWrappedIndex(playerIndex, state.players.length)
    const player = state.players[i]
    const target = findFreeTier(player)
    player.cards.push({ card, tier: target })
    playerIndex++
  }

  state.pickupPile = deck
  state.queue = [playerIds[0]]
  state.burnt = []
  state.stack = []
}
