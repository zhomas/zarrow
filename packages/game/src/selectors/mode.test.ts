import it from 'ava'
import {
  getStore,
  hasLock,
  highlightedLocationSelector,
  playCardThunk,
} from '..'
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

it('highlights the replenish pile when necessary', async (t) => {
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

  await new Promise((r) => setTimeout(r, 500))

  const location = selector(store.getState())

  t.deepEqual(location, 'replenish')
})

it('highlights my oppenent while he is choosing from his hand', (t) => {
  const selector = highlightedLocationSelector('def')
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
      {
        id: 'def',
        faction: 0,
        displayName: 'Tom',
        cards: [{ card: createCard('3', 'S'), tier: 1 }],
      },
    ],
    focused: '',
  })

  const location = selector(store.getState())

  t.deepEqual(location, ['playerID', 'abc'])
})

it('highlights play:downs when I am on my down cards', (t) => {
  const store = getStore({
    direction: -1,
    queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2', 'FJD2vQIVnEcmFymBCfYxPdSQfhD3'],
    players: [
      {
        cards: [
          {
            tier: 0,
            card: {
              suit: 'C',
              id: '5C',
              value: '5',
            },
          },
          {
            tier: 0,
            card: {
              suit: 'D',
              id: '8D',
              value: '8',
            },
          },
          {
            tier: 0,
            card: {
              suit: 'H',
              id: '10H',
              value: '10',
            },
          },
          {
            tier: 0,
            card: {
              suit: 'S',
              id: '2S',
              value: '2',
            },
          },
        ],
        displayName: 'nkjnjkhj',
        faction: 1,
        id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      },
      {
        cards: [
          {
            tier: 0,
            card: {
              suit: 'D',
              id: '7D',
              value: '7',
            },
          },
          {
            tier: 0,
            card: {
              suit: 'S',
              id: 'JS',
              value: 'J',
            },
          },
          {
            tier: 0,
            card: {
              suit: 'D',
              id: 'QD',
              value: 'Q',
            },
          },
          {
            tier: 0,
            card: {
              suit: 'C',
              id: 'AC',
              value: 'A',
            },
          },
          {
            tier: 1,
            card: {
              suit: 'S',
              id: '7S',
              value: '7',
            },
          },
          {
            tier: 1,
            card: {
              suit: 'H',
              id: '2H',
              value: '2',
            },
          },
          {
            tier: 1,
            card: {
              suit: 'H',
              id: '6H',
              value: '6',
            },
          },
          {
            tier: 1,
            card: {
              suit: 'D',
              id: '4D',
              value: '4',
            },
          },
          {
            tier: 2,
            card: {
              suit: 'S',
              id: '3S',
              value: '3',
            },
          },
          {
            tier: 2,
            card: {
              suit: 'C',
              id: 'KC',
              value: 'K',
            },
          },
          {
            tier: 2,
            card: {
              suit: 'H',
              id: 'AH',
              value: 'A',
            },
          },
          {
            tier: 2,
            card: {
              suit: 'D',
              id: 'JD',
              value: 'J',
            },
          },
          {
            tier: 2,
            card: {
              suit: 'H',
              id: '5H',
              value: '5',
            },
          },
          {
            tier: 2,
            card: {
              suit: 'C',
              id: 'QC',
              value: 'Q',
            },
          },
        ],
        displayName: 'njkhkjh',
        faction: 0,
        id: 'FJD2vQIVnEcmFymBCfYxPdSQfhD3',
      },
    ],
    stack: [
      {
        suit: 'S',
        id: '6S',
        value: '6',
      },
      {
        suit: 'C',
        id: '8C',
        value: '8',
      },
    ],
    burnt: [],
    pickupPile: [],
    turnLocks: [],
    local: {
      targetUID: '',
      faceUpPickID: '',
    },
    focused: '',
  })

  const selector = userModeSelector('NRUF3fQBIvTw8GkKMAoaMH9z6wC2')
  const mode = selector(store.getState())
  t.is(mode, 'play:downs')
})

it('does not highlight while burning', async (t) => {
  const selector = highlightedLocationSelector('abc')
  const { getState, dispatch } = getStore({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: [],
    stack: [createCard('3', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('10', 'S'), tier: 2 },
          { card: createCard('2', 'S'), tier: 2 },
        ],
      },
    ],
    focused: '',
  })

  dispatch(
    playCardThunk({
      cards: [createCard('10', 'S')],
      playerID: 'abc',
    }),
  )

  await new Promise((r) => setTimeout(r, 500))
  t.is(hasLock('burn')(getState()), true)
  t.is(selector(getState()), 'none')
})

it('does not highlight while acing', async (t) => {
  const selector = highlightedLocationSelector('abc')
  const { getState, dispatch } = getStore({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    turnLocks: ['user:target'],
    stack: [createCard('3', 'S')],
    players: [
      {
        id: 'abc',
        faction: 0,
        displayName: 'Tom',
        cards: [
          { card: createCard('10', 'S'), tier: 2 },
          { card: createCard('2', 'S'), tier: 2 },
        ],
      },
    ],
    focused: '',
  })

  t.is(selector(getState()), 'none')
})
