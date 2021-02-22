import { cardsInHandSelector } from '..'
import { GameState } from '../game.slice'
import { CardModel, PlayerCard, PlayerModel } from '../types'
import { getWrappedIndex } from '../utils'

type PartialState = Pick<GameState, 'players'>
type Val = CardModel['value']
type ValMap = {
  [K in CardModel['value']]: number
}

const map: ValMap = {
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  '10': 8,
  J: 9,
  Q: 10,
  K: 11,
  A: 12,
}

const getSortedCards = (state: PartialState, uid: string) => {
  return cardsInHandSelector(uid)(state).sort(
    (a, b) => map[a.value] - map[b.value],
  )
}

export const sortHand = (state: PartialState, uid: string) => {
  const player = state.players.find((p) => p.id === uid)

  if (!player) return

  const sortedHand: PlayerCard[] = getSortedCards(state, uid).map((c) => ({
    card: c,
    tier: 2,
  }))

  const untouched = player.cards.filter((c) => c.tier < 2)

  player.cards = [...untouched, ...sortedHand]
}

export const isHandSortedSelector = (uid: string) => (state: PartialState) => {
  const hand = cardsInHandSelector(uid)(state)
  const sorted = getSortedCards(state, uid)
  return JSON.stringify(hand) === JSON.stringify(sorted)
}
