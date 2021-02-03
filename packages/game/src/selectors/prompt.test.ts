import it from 'ava'
import { createCard } from '../deck'
import { promptSelector } from './prompt'

const card = createCard('3', 'H')

it('prompts to the hand when necessary', (t) => {
  const actual = promptSelector({
    direction: 1,
    next: undefined,
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
    ],
    stack: [],
  })

  t.is(actual, 'hand')
})

it('prompts to the pickup pile when necessary', (t) => {
  const actual = promptSelector({
    next: '5JCELWeYKGgu3f5C1XS2BiHmGFL2',
    stack: [
      { label: 'JS', suit: 'S', value: 'J' },
      { label: '5H', suit: 'H', value: '5' },
    ],
    players: [
      {
        cards: [{ tier: 2, card: { label: '10C', suit: 'C', value: '10' } }],
        displayName: '',
        faction: 1,
        id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      },
      {
        cards: [{ tier: 2, card: { label: '3D', suit: 'D', value: '3' } }],
        displayName: 'Chad',
        faction: 0,
        id: '5JCELWeYKGgu3f5C1XS2BiHmGFL2',
      },
    ],
    pickupPile: [{ label: '5S', suit: 'S', value: '5' }],
    burnt: [],
    queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2'],
    direction: 1,
  })

  t.is(actual, 'pickupPile')
})

it('prompts to the stack when necessary', (t) => {
  const actual = promptSelector({
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
        cards: [{ card, tier: 2 }],
      },
    ],
    stack: [createCard('A', 'D')],
  })

  t.is(actual, 'stack')
})
