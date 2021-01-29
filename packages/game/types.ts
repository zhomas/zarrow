export const suits = ['C', 'H', 'S', 'D'] as const

export const values = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const

export interface CardModel {
  suit: typeof suits[number]
  value: typeof values[number]
  label: string
}

interface PlayerCard {
  card: CardModel
  tier: number
}

export interface PlayerModel {
  id: string | number
  cards: PlayerCard[]
}
