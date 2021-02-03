import it from 'ava'
import { GameState, activePlayerSelector } from '..'
import { createCard } from '../deck'
import { endTurn } from './endTurn'
import { playCard } from './play'

const card = createCard('3', 'H')

const getState = (): GameState => ({
  direction: 1,
  next: '',
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
      faction: 0,
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
      faction: 0,
      displayName: '',
      cards: [{ card, tier: 2 }],
    },
  ],
  stack: [],
})

it('does not proceed until the turn is ended', (t) => {
  const state = getState()
  const original = activePlayerSelector(state)
  playCard(state, card)
  const expected = state.next
  t.is(activePlayerSelector(state).id, original.id)
  endTurn(state)
  t.is(activePlayerSelector(state).id, expected)
  t.falsy(state.next)
})

//it('proceeds if no replenish is necessary', (t) => {})
