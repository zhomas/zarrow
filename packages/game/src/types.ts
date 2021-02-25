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
  id: string
}

export interface PlayerCard {
  card: CardModel
  tier: number
}

export interface PlayerModel {
  id: string
  displayName: string
  faction: number
  cards: PlayerCard[]
}

export type TurnLock =
  | 'animate'
  | 'burn'
  | 'user:replenish'
  | 'user:target'
  | 'user:faceuptake'
  | 'user:psychicreveal'

export type TurnClock =
  | 'ww7'
  | 'skip'
  | 'glideonby'
  | 'dw7'
  | 'burn'
  | 'reset'
  | 'chainedqueen'
  | 'queen'
