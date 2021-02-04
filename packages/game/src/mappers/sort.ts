import { CardModel, PlayerModel, values } from '../types'

const sortOrder = values

type Value = CardModel['value']

const getSortOrder = (v: Value): number => {
  const map = {
    A: 12,
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
  }

  return map[v]
}

export const getSorted = (player: PlayerModel): PlayerModel => {
  const downs = player.cards.filter((c) => c.tier === 0)
  const ups = player.cards
    .filter((c) => c.tier === 1)
    .sort((a, b) => getSortOrder(a.card.value) - getSortOrder(b.card.value))
  const hand = player.cards
    .filter((c) => c.tier === 2)
    .sort((a, b) => getSortOrder(a.card.value) - getSortOrder(b.card.value))

  return {
    ...player,
    cards: [...downs, ...ups, ...hand],
  }
}
