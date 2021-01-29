import it from 'ava'
import { createCard } from '../deck'
import { winnersSelector } from './win'

const card = createCard('3', 'S')

it('marks a player as a winner when all cards played', (t) => {
  const state = {
    turnIndex: 0,
    pickupPile: [],
    burnt: [],
    players: [
      {
        id: 'a',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        cards: [{ card, tier: 0 }],
      },
      {
        id: 'c',
        cards: [],
      },
    ],
    stack: [],
  }

  const winners = winnersSelector(state)

  t.deepEqual(winners, ['c'])
})
