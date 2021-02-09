import reducer, { activeTierSelector } from './game.slice'
import it from 'ava'
import { CardModel } from './types'

it('chooses from the active tier', (t) => {
  const card: CardModel = {
    value: '3',
    suit: 'D',
    id: '',
  }

  const a = activeTierSelector({
    pickupPile: [],
    burnt: [],
    direction: 1,
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card, tier: 0 },
          { card, tier: 0 },
          { card, tier: 1 },
        ],
      },
    ],
    stack: [],
  })

  t.is(a.length, 1)
})
