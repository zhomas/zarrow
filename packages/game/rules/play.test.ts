import it from 'ava'
import { createCard } from '../deck'
import { activePlayerSelector, GameState } from '../game.slice'
import { CardModel } from '../types'
import { playCard } from './play'

const card = createCard('3', 'H')

const getState = (): GameState => ({
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

it('can play a 3 on an empty stack', (t) => {
  const state = getState()
  playCard(state, card)
  t.is(state.stack.length, 1)
  t.is(state.players[0].cards.length, 0)
})

it('replenishes the hand from the pickup pile', (t) => {
  const state = {
    ...getState(),
    pickupPile: [card, card, card, card],
  }

  playCard(state, card)
  t.is(state.players[0].cards.length, 4)
})

it('moves to the next player when a card is played', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, card)
  t.is(activePlayerSelector(state).id, 'b')
})

it('moves to the previous player when a card is played and the order is reversed', (t) => {
  const state = { ...getState(), direction: -1 }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, card)
  t.is(activePlayerSelector(state).id, 'd')
})

it('skips the next player when a 5 is played', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, createCard('5', 'D'))
  t.is(activePlayerSelector(state).id, 'c')
})

it('remains on the same player when a 10 is played', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, createCard('10', 'D'))
  t.is(activePlayerSelector(state).id, 'a')
})

it('burns the stack when a 10 is played', (t) => {
  const state = { ...getState(), stack: [card] }
  playCard(state, createCard('10', 'D'))
  t.is(state.stack.length, 0)
  t.is(state.burnt.length, 2)
})

it('reverses direction when a 7 is played', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, createCard('7', 'D'))
  t.is(state.direction, -1)
  t.is(activePlayerSelector(state).id, 'd')
  playCard(state, createCard('2', 'D'))
  t.is(activePlayerSelector(state).id, 'c')
})

it('preserves direction on double whacky 7s', (t) => {
  const state = { ...getState() }
  t.is(activePlayerSelector(state).id, 'a')
  playCard(state, createCard('7', 'D'), createCard('7', 'H'))
  t.is(state.direction, 1)
  t.is(activePlayerSelector(state).id, 'b')
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
  t.is(activePlayerSelector(state).id, 'd')
})

it('does not move to players that are out', (t) => {
  t.pass()
  const state = {
    ...getState(),
    queue: ['b'],
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
        cards: [],
      },
    ],
  }
  t.is(activePlayerSelector(state).id, 'b')
  playCard(state, card)
  t.is(activePlayerSelector(state).id, 'a')
})

it('plays multiple cards at once', (t) => {
  const s = createCard('3', 'S')
  const h = createCard('3', 'H')

  const state = {
    ...getState(),
    players: [
      {
        id: 'a',
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
    label: '',
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

it('burns when four of a kind are added to the stack', (t) => {
  const state = {
    ...getState(),
    stack: [createCard('3', 'C'), createCard('3', 'H'), createCard('3', 'S')],
  }

  playCard(state, createCard('3', 'D'))

  t.is(state.stack.length, 0)
})

it('ignores 8s for four of a kind calculations', (t) => {
  const state = {
    ...getState(),
    stack: [
      createCard('3', 'C'),
      createCard('8', 'C'),
      createCard('3', 'H'),
      createCard('3', 'S'),
    ],
  }

  playCard(state, createCard('3', 'D'))

  t.is(state.stack.length, 0)
})

it('burns when four 8s are played', (t) => {
  const state = {
    ...getState(),
    stack: [createCard('8', 'C'), createCard('8', 'H'), createCard('8', 'S')],
  }

  playCard(state, createCard('8', 'D'))

  t.is(state.stack.length, 0)
})
