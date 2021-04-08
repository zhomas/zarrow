import it from 'ava'
import { createDeck } from '../deck'
import { activePlayerSelector } from '../selectors'
import { dealCards } from './deal'
import { getDummyState } from './_test.helpers'

const getState = () => ({
  ...getDummyState(),
  players: [
    { id: 'a', faction: 1, cards: [], displayName: '' },
    { id: 'b', faction: 1, cards: [], displayName: '' },
    { id: 'c', faction: 2, cards: [], displayName: '' },
    { id: 'd', faction: 2, cards: [], displayName: '' },
  ],
})

it('deals a fresh game', (t) => {
  const state = getState()
  const deck = createDeck()

  dealCards(state, deck)

  t.is(state.players.length, 4)

  state.players.forEach((p) => {
    t.is(p.cards.length, 12)
    t.is(p.cards.filter((c) => c.tier === 0).length, 4)
    t.is(p.cards.filter((c) => c.tier === 2).length, 8)
  })
})

it('sets the first player', (t) => {
  const state = getState()
  const deck = createDeck()

  dealCards(state, deck)

  t.is(activePlayerSelector(state).id, 'a')
})

it('deals a small game', (t) => {
  const state = getState()
  const deck = createDeck(16)

  dealCards(state, deck)

  t.is(state.players.length, 4)

  state.players.forEach((p) => {
    t.is(p.cards.length, 4)
  })
})
