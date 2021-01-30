import { GameState } from '..'
import { createCard } from '../deck'

const card = createCard('3', 'C')

export const getDummyState = (): GameState => ({
  factions: [],
  direction: 1,
  pickupPile: [],
  burnt: [],
  queue: ['a'],
  players: [
    {
      id: 'a',
      cards: [{ card, tier: 2 }],
    },
    {
      id: 'b',
      cards: [{ card, tier: 2 }],
    },
    {
      id: 'c',
      cards: [{ card, tier: 2 }],
    },
    {
      id: 'd',
      cards: [{ card, tier: 2 }],
    },
  ],
  stack: [],
})
