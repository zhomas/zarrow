import it from 'ava'
import { createCard } from '../deck'
import { activePlayerSelector, GameState } from '../game.slice'
import { CardModel } from '../types'
import { playCard } from './play'

const card = createCard('3', 'H')

const getState = (): GameState => ({
  direction: 1,
  pickupPile: [card],
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

it('can play a 3 on an empty stack', (t) => {
  const state = getState()
  playCard(state, card)
  t.is(state.stack.length, 1)
  t.is(state.players[0].cards.length, 0)
})

it('marks the turn as stale', (t) => {
  const state: GameState = { ...getState(), turnIsFresh: true }
  playCard(state, card)
  t.is(state.turnIsFresh, false)
})

it('reverses direction when a 7 is played', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, createCard('7', 'D'))
  t.is(state.direction, -1)
})

it('preserves direction on double whacky 7s', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, createCard('7', 'D'), createCard('7', 'H'))
  t.is(state.direction, 1)
})

it('reverses direction on triple whacky 7s', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(
    state,
    createCard('7', 'D'),
    createCard('7', 'C'),
    createCard('7', 'S'),
  )
  t.is(state.direction, -1)
})

it('plays multiple cards at once', (t) => {
  const s = createCard('3', 'S')
  const h = createCard('3', 'H')

  const state = {
    ...getState(),
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: s, tier: 2 },
          { card: h, tier: 2 },
        ],
      },
    ],
  }

  playCard(state, s, h)

  t.is(state.players[0].cards.length, 0)
})

it('can play a 3 on a 3', (t) => {
  const state = { ...getState(), stack: [card] }
  playCard(state, card)
  t.is(state.stack.length, 2)
  t.is(state.players[0].cards.length, 0)
})

it('can play a 3D on a JD', (t) => {
  const state = { ...getState(), stack: [createCard('J', 'D')] }
  playCard(state, createCard('3', 'D'))
  t.is(state.stack.length, 2)
})

it('cannot play a QC on a JD', (t) => {
  const state = { ...getState(), stack: [createCard('J', 'D')] }
  playCard(state, createCard('Q', 'C'))
  t.is(state.stack.length, 1)
})

it('can play 2 jacks on a JD', (t) => {
  const state = { ...getState(), stack: [createCard('J', 'D')] }
  playCard(state, createCard('J', 'C'), createCard('J', 'S'))
  t.is(state.stack.length, 3)
})

it('can play an 8 on a JD', (t) => {
  const state = { ...getState(), stack: [createCard('J', 'D')] }
  playCard(state, createCard('8', 'H'))
  t.is(state.stack.length, 2)
})

it('cannot play a 3 on a 4', (t) => {
  const four: CardModel = {
    value: '4',
    suit: 'D',
    id: '',
  }

  const state = { ...getState(), stack: [four] }

  playCard(state, card)

  t.is(state.stack.length, 1)
  t.is(state.players[0].cards.length, 1)
})

it('treats 8s as invisible', (t) => {
  const state = {
    ...getState(),
    stack: [createCard('8', 'D'), createCard('3', 'S')],
  }
  playCard(state, card)
  t.is(state.stack.length, 3)
})

it('ends the turn when there are no cards to pick up', (t) => {
  const state: GameState = {
    ...getState(),
    pickupPile: [],
  }

  const original = activePlayerSelector(state)
  playCard(state, createCard('8', 'D'))

  t.not(activePlayerSelector(state).id, original.id)
})
