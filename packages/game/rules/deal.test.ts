import it from 'ava'
import { createDeck } from '../deck'
import { activePlayerSelector, initialState } from '../game.slice'
import { dealCards } from './deal'

it('deals a fresh game', (t) => {
  const state = { ...initialState }
  const deck = createDeck()
  const initialiser = {
    factions: [
      ['a', 'b'],
      ['c', 'd'],
    ],
    deck,
  }

  dealCards(state, initialiser)

  t.is(state.players.length, 4)

  state.players.forEach((p) => {
    t.is(p.cards.length, 12)
    t.is(p.cards.filter((c) => c.tier === 0).length, 4)
    t.is(p.cards.filter((c) => c.tier === 1).length, 4)
    t.is(p.cards.filter((c) => c.tier === 2).length, 4)
  })
})

it('sets the first player', (t) => {
  const state = { ...initialState }
  const deck = createDeck()
  const initialiser = {
    factions: [
      ['a', 'b'],
      ['c', 'd'],
    ],
    deck,
  }

  dealCards(state, initialiser)

  t.is(activePlayerSelector(state).id, 'a')
})

it('weaves two factions', (t) => {
  const state = { ...initialState }
  const deck = createDeck()
  const initialiser = {
    factions: [
      ['a', 'b'],
      ['c', 'd'],
    ],
    deck,
  }

  dealCards(state, initialiser)

  t.is(
    state.players.findIndex((p) => p.id === 'a'),
    0,
  )
  t.is(
    state.players.findIndex((p) => p.id === 'b'),
    2,
  )
  t.is(
    state.players.findIndex((p) => p.id === 'c'),
    1,
  )
  t.is(
    state.players.findIndex((p) => p.id === 'd'),
    3,
  )
})

it('deals a small game', (t) => {
  const state = { ...initialState }
  const deck = createDeck(16)
  const initialiser = {
    factions: [
      ['a', 'b'],
      ['c', 'd'],
    ],
    deck,
  }

  dealCards(state, initialiser)

  t.is(state.players.length, 4)

  state.players.forEach((p) => {
    t.is(p.cards.length, 4)
  })
})
