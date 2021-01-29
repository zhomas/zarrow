import it from 'ava'
import { createCard } from '../deck'
import { activePlayerSelector } from '../game.slice'

const card = createCard('3', 'H')

const getState = () => ({
  turnIndex: 0,
  pickupPile: [],
  burnt: [],
  players: [
    {
      id: 'a',
      cards: [],
    },
    {
      id: 'b',
      cards: [{ card, tier: 0 }],
    },
    {
      id: 'c',
      cards: [{ card, tier: 0 }],
    },
  ],
  stack: [],
})

it('skips players that are already out', (t) => {
  const state = getState()
  const active = activePlayerSelector(state)
  t.is(active.id, 'b')
})
