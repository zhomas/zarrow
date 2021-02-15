import it from 'ava'
import { getStore, highlightedLocationSelector, playCardThunk } from '..'
import { createCard } from '../deck'
import { userModeSelector } from './mode'

it('requires playing from the face ups when a card can play', (t) => {
  const selector = userModeSelector('abc')
  const mode = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    turnLocks: [],
    queue: ['abc'],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('2', 'S'), tier: 1 },
          { card: createCard('4', 'S'), tier: 1 },
        ],
      },
    ],
  })

  t.is(mode, 'play:ups')
})

it('prompts a pickup when no face up card can play', (t) => {
  const selector = userModeSelector('abc')
  const mode = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    turnLocks: [],
    queue: ['abc'],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('3', 'S'), tier: 1 },
          { card: createCard('4', 'S'), tier: 1 },
        ],
      },
    ],
  })

  t.is(mode, 'pickup:stack')
})

it('requires playing from the face downs even when no card can play', (t) => {
  const selector = userModeSelector('abc')
  const mode = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    turnLocks: [],
    queue: ['abc'],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('3', 'S'), tier: 0 },
          { card: createCard('4', 'S'), tier: 0 },
        ],
      },
    ],
  })

  t.is(mode, 'play:downs')
})

it('requires pickup when the revealed facedown card cannot play on the stack', (t) => {
  const selector = userModeSelector('abc')
  const mode = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('3', 'S'), tier: 0 },
          { card: createCard('2', 'S'), tier: 0 },
        ],
      },
    ],
    focused: '3S',
  })

  t.is(mode, 'pickup:stack')
})

it('requires no pickup with a falsy focus card', (t) => {
  const selector = userModeSelector('abc')
  const mode = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('3', 'S'), tier: 0 },
          { card: createCard('2', 'S'), tier: 0 },
        ],
      },
    ],
    focused: '',
  })

  t.is(mode, 'play:downs')
})

it('highlights my hand if active', (t) => {
  const selector = highlightedLocationSelector('a')
  const location = selector({
    direction: 1,
    queue: ['a', 'b'],
    players: [
      {
        cards: [
          { tier: 2, card: { suit: 'C', id: 'AC', value: 'A' } },
          { tier: 2, card: { suit: 'H', id: 'KH', value: 'K' } },
        ],
        displayName: 'sfsddfd',
        faction: 0,
        id: 'b',
      },
      {
        cards: [
          { tier: 2, card: { suit: 'S', id: '3S', value: '3' } },
          { tier: 2, card: { suit: 'C', id: '8C', value: '8' } },
          { tier: 2, card: { suit: 'H', id: 'AH', value: 'A' } },
        ],
        displayName: '',
        faction: 1,
        id: 'a',
      },
    ],
    stack: [
      { suit: 'H', id: '2H', value: '2' },
      { suit: 'S', id: '7S', value: '7' },
      { suit: 'D', id: '6D', value: '6' },
      { suit: 'C', id: '4C', value: '4' },
    ],
    burnt: [],
    pickupPile: [],
    turnLocks: [],
    local: { targetUID: '', faceUpPickID: '' },
    focused: '',
  })

  t.deepEqual(location, 'hand')
})

it('highlights my face ups if active', (t) => {
  const selector = highlightedLocationSelector('abc')
  const location = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('3', 'S'), tier: 0 },
          { card: createCard('2', 'S'), tier: 1 },
        ],
      },
    ],
    focused: '',
  })

  t.deepEqual(location, ['playerID', 'abc'])
})

it('highlights my opponents', (t) => {
  const selector = highlightedLocationSelector('abc')
  const location = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['def'],
    turnLocks: [],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('3', 'S'), tier: 0 },
          { card: createCard('2', 'S'), tier: 1 },
        ],
      },
      {
        id: 'def',
        faction: 0,
        displayName: 'Burt',
        cards: [
          { card: createCard('3', 'S'), tier: 0 },
          { card: createCard('2', 'S'), tier: 1 },
        ],
      },
    ],
    focused: '',
  })

  t.deepEqual(location, ['playerID', 'def'])
})

it('highlights my face downs if active', (t) => {
  const selector = highlightedLocationSelector('abc')
  const location = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [{ card: createCard('3', 'S'), tier: 0 }],
      },
    ],
    focused: '',
  })

  t.deepEqual(location, ['playerID', 'abc'])
})

it('highlights the stack if I need to pick up', (t) => {
  const selector = highlightedLocationSelector('abc')
  const location = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('A', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [{ card: createCard('3', 'S'), tier: 2 }],
      },
    ],
    focused: '',
  })

  t.deepEqual(location, 'stack')
})

it('highlights the replenish pile when necessary', (t) => {
  const selector = highlightedLocationSelector('abc')
  const store = getStore({
    burnt: [],
    direction: 1,
    pickupPile: [createCard('3', 'S')],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('2', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [{ card: createCard('3', 'S'), tier: 2 }],
      },
    ],
    focused: '',
  })

  store.dispatch(
    playCardThunk({ cards: [createCard('3', 'S')], playerID: 'abc' }),
  )

  const location = selector(store.getState())

  t.deepEqual(location, 'replenish')
})
