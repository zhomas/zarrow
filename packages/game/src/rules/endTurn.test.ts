import it from 'ava'
import { activePlayerSelector } from '..'
import { createCard } from '../deck'
import { getPlayerSelector } from '../selectors'
import { endTurn } from './endTurn'

const card = createCard('3', 'H')

it('moves to the next player when a card is on the stack', (t) => {
  const state = {
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
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    stack: [card],
  }

  endTurn(state)
  t.is(activePlayerSelector(state).id, 'b')
})

it('replenishes cards', (t) => {
  const state = {
    direction: 1,
    pickupPile: [card, card, card],
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
    ],
    stack: [card],
  }

  endTurn(state)
  t.is(getPlayerSelector('a')(state).cards.length, 4)
  t.is(state.pickupPile.length, 0)
})

it('stays on the same player when the stack is empty', (t) => {
  const state = {
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
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    stack: [],
  }

  endTurn(state)
  t.is(activePlayerSelector(state).id, 'a')
})

it('skips a go', (t) => {
  const state = {
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
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    stack: [createCard('5', 'D')],
  }

  endTurn(state)
  t.is(activePlayerSelector(state).id, 'a')
})

it('skips a go in reverse', (t) => {
  const state = {
    direction: -1,
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
    ],
    stack: [createCard('5', 'D')],
  }

  endTurn(state)
  t.is(activePlayerSelector(state).id, 'b')
})

it('marks the turn as fresh', (t) => {
  const state = {
    direction: -1,
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
    ],
    stack: [createCard('5', 'D')],
    turnIsFresh: false,
  }

  endTurn(state)

  t.is(state.turnIsFresh, true)
})
