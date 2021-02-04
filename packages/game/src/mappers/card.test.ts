import it from 'ava'
import { GameState } from '..'
import { createCard } from '../deck'
import { getResolved } from './card'

const card = createCard('3', 'S')

const getState = (): GameState => ({
  direction: 1,
  next: '',
  pickupPile: [card],
  burnt: [],
  queue: ['a'],
  players: [
    {
      id: 'a',
      faction: 0,
      displayName: '',
      cards: [
        { card, tier: 0 },
        { card, tier: 1 },
        { card, tier: 2 },
      ],
    },
  ],
  stack: [createCard('A', 'D')],
})

it('resolves a players cards', (t) => {
  const state = getState()
  const resolved = getResolved(state.players[0], state)
  t.deepEqual(resolved.cards, [
    { card, tier: 0, canPlay: false },
    { card, tier: 1, canPlay: false },
    { card, tier: 2, canPlay: false },
  ])
})
