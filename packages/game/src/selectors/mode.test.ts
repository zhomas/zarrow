import it from 'ava'
import { createCard } from '../deck'
import { userModeSelector } from './mode'

it('requires playing from the face ups when a card can play', (t) => {
  const selector = userModeSelector('abc')
  const mode = selector({
    burnt: [],
    direction: 1,
    pickupPile: [],
    queue: ['abc'],
    deck: {},
    turnIsFresh: true,
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
    queue: ['abc'],
    deck: {},
    turnIsFresh: true,
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
    queue: ['abc'],
    turnIsFresh: true,
    stack: [createCard('A', 'S')],
    deck: {},
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
    deck: {
      '3S': {
        value: '3',
        suit: 'S',
        label: '3S',
      },
    },
    turnIsFresh: true,
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
    focused: {
      value: '3',
      suit: 'S',
    },
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
    deck: {
      '3S': {
        value: '3',
        suit: 'S',
        label: '3S',
      },
    },
    turnIsFresh: true,
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
    focused: {
      value: '',
      suit: '',
    },
  })

  t.is(mode, 'play:downs')
})
