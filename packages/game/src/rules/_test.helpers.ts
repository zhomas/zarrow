import { GameState } from '../game.slice'
import { createCard } from '../deck'

const card = createCard('3', 'C')

export const getDummyState = (): GameState => ({
  direction: 1,
  pickupPile: [],
  burnt: [],
  queue: ['a'],
  players: [
    {
      id: 'a',
      faction: 0,
      displayName: '',
      cards: [{ card, tier: 2 }],
    },
    {
      id: 'b',
      faction: 1,
      displayName: '',
      cards: [{ card, tier: 2 }],
    },
    {
      id: 'c',
      faction: 0,
      displayName: '',
      cards: [{ card, tier: 2 }],
    },
    {
      id: 'd',
      faction: 1,
      displayName: '',
      cards: [{ card, tier: 2 }],
    },
  ],
  stack: [],
})
