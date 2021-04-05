import { GameState } from 'game'
import { createCardByID } from 'game/dist/deck'

export const pickUpOnEmpty: GameState = {
  direction: 1,
  burning: false,
  animating: false,
  queue: ['Jj2c3OMxphY26S1k3qQwB0LCiQ43'],
  players: [
    {
      id: 'Jj2c3OMxphY26S1k3qQwB0LCiQ43',
      cards: [
        { card: { suit: 'D', value: '4', id: '4D' }, tier: 0 },
        { card: { suit: 'D', value: '8', id: '8D' }, tier: 0 },
        { card: { suit: 'D', value: 'J', id: 'JD' }, tier: 0 },
        { card: { suit: 'D', value: 'Q', id: 'QD' }, tier: 0 },
        { card: { suit: 'H', value: '9', id: '9H' }, tier: 1 },
        { card: { suit: 'C', value: 'K', id: 'KC' }, tier: 1 },
        { card: { suit: 'H', value: '5', id: '5H' }, tier: 1 },
        { card: { suit: 'D', value: '7', id: '7D' }, tier: 1 },
        { card: { suit: 'C', value: '4', id: '4C' }, tier: 2 },
        { card: { suit: 'C', value: '9', id: '9C' }, tier: 2 },
        { card: { suit: 'S', value: '6', id: '6S' }, tier: 2 },
        { card: { suit: 'D', value: '3', id: '3D' }, tier: 2 },
      ],
      faction: 0,
      displayName: 'Tombola',
    },
    {
      cards: [
        { card: { suit: 'C', value: '5', id: '5C' }, tier: 0 },
        { card: { suit: 'S', value: '7', id: '7S' }, tier: 0 },
        { card: { suit: 'S', value: '3', id: '3S' }, tier: 0 },
        { card: { suit: 'H', value: '10', id: '10H' }, tier: 0 },
        { card: { suit: 'S', value: 'J', id: 'JS' }, tier: 1 },
        { card: { suit: 'H', value: 'A', id: 'AH' }, tier: 1 },
        { card: { suit: 'H', value: '6', id: '6H' }, tier: 1 },
        { card: { suit: 'S', value: '2', id: '2S' }, tier: 1 },
        { card: { suit: 'C', value: '8', id: '8C' }, tier: 2 },
        { card: { suit: 'S', value: '10', id: '10S' }, tier: 2 },
        { card: { suit: 'C', value: 'A', id: 'AC' }, tier: 2 },
        { card: { suit: 'H', value: '2', id: '2H' }, tier: 2 },
      ],
      displayName: 'F',
      id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      faction: 1,
    },
  ],
  stack: [],
  burnt: [],
  pickupPile: [],
  turnLocks: [],
  afterimage: [{ suit: 'S', value: 'Q', id: 'QS' }],
  local: { targetUID: '', faceUpPickID: '' },
  stackEffect: '',
  activeSteal: {
    participants: [],
    userSteals: 0,
    reciprocatedSteals: 0,
  },
  focused: '',
}

export const nearEnd: GameState = {
  direction: 1,
  burning: false,
  animating: false,
  queue: ['Jj2c3OMxphY26S1k3qQwB0LCiQ43', 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2'],
  players: [
    {
      displayName: 'Tombola',
      cards: [
        { card: { value: '4', id: '4D', suit: 'D' }, stolen: false, tier: 0 },
        { stolen: false, card: { value: '8', id: '8D', suit: 'D' }, tier: 0 },
        { stolen: false, card: { suit: 'D', id: 'JD', value: 'J' }, tier: 0 },
        { tier: 0, card: { suit: 'D', id: 'QD', value: 'Q' }, stolen: false },
        { stolen: false, card: { value: '9', id: '9H', suit: 'H' }, tier: 1 },
        { tier: 1, stolen: false, card: { suit: 'C', value: 'K', id: 'KC' } },
        { stolen: false, card: { value: '5', suit: 'H', id: '5H' }, tier: 1 },
        { card: { suit: 'D', id: '7D', value: '7' }, tier: 1, stolen: false },
        { stolen: false, card: { suit: 'C', id: '9C', value: '9' }, tier: 2 },
        { tier: 2, stolen: false, card: { id: 'AC', value: 'A', suit: 'C' } },
        { tier: 2, card: { suit: 'S', id: 'JS', value: 'J' }, stolen: false },
        { tier: 2, stolen: false, card: { suit: 'S', id: '6S', value: '6' } },
        { stolen: false, tier: 2, card: { suit: 'C', value: '4', id: '4C' } },
      ],
      faction: 0,
      id: 'Jj2c3OMxphY26S1k3qQwB0LCiQ43',
    },
    {
      faction: 1,
      displayName: 'F',
      id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      cards: [
        { card: { value: '5', id: '5C', suit: 'C' }, stolen: false, tier: 0 },
        { card: { id: '7S', suit: 'S', value: '7' }, tier: 0, stolen: false },
      ],
    },
  ],
  stack: [{ suit: 'S', value: '3', id: '3S' }],
  burnt: [
    { suit: 'H', id: '10H', value: '10' },
    { suit: 'D', id: '3D', value: '3' },
    { suit: 'S', value: '2', id: '2S' },
    { id: '8C', suit: 'C', value: '8' },
    { suit: 'H', value: 'A', id: 'AH' },
    { suit: 'H', id: '2H', value: '2' },
    { suit: 'H', value: '6', id: '6H' },
    { value: '10', suit: 'S', id: '10S' },
  ],
  pickupPile: [],
  turnLocks: [],
  afterimage: [],
  local: { targetUID: '', faceUpPickID: '' },
  activeSteal: {
    targeting: false,
    userSteals: 0,
    reciprocatedSteals: 0,
    participants: [],
  },
  focused: '',
}

export const fupuPending: GameState = {
  direction: -1,
  burning: false,
  animating: false,
  queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2', 'Jj2c3OMxphY26S1k3qQwB0LCiQ43'],
  players: [
    {
      displayName: 'Tombola',
      faction: 0,
      id: 'Jj2c3OMxphY26S1k3qQwB0LCiQ43',
      cards: [
        { card: { id: '2S', value: '2', suit: 'S' }, stolen: false, tier: 0 },
        { card: { suit: 'H', value: '6', id: '6H' }, stolen: false, tier: 0 },
        { stolen: false, card: { id: '9H', suit: 'H', value: '9' }, tier: 1 },
      ],
    },
    {
      displayName: 'F',
      cards: [
        { card: { value: '7', id: '7S', suit: 'S' }, tier: 2, stolen: false },
        { stolen: false, tier: 0, card: { value: '9', suit: 'C', id: '9C' } },
        { tier: 0, stolen: false, card: { id: '10H', value: '10', suit: 'H' } },
        { card: { suit: 'C', id: '5C', value: '5' }, stolen: false, tier: 0 },
        { stolen: false, tier: 1, card: { value: 'J', suit: 'S', id: 'JS' } },
        { card: { suit: 'D', value: '4', id: '4D' }, stolen: false, tier: 1 },
        { stolen: false, card: { id: '8D', value: '8', suit: 'D' }, tier: 2 },
        { card: { value: 'A', id: 'AC', suit: 'C' }, tier: 2, stolen: false },
        { tier: 2, stolen: false, card: { value: '2', suit: 'H', id: '2H' } },
        { tier: 2, card: { value: 'A', id: 'AH', suit: 'H' }, stolen: false },
        { card: { value: '3', suit: 'S', id: '3S' }, tier: 2, stolen: false },
        { card: { value: '8', id: '8C', suit: 'C' }, stolen: false, tier: 2 },
        { stolen: false, card: { value: '10', suit: 'S', id: '10S' }, tier: 2 },
      ],
      faction: 1,
      id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
    },
  ],
  stack: [
    { id: '6S', suit: 'S', value: '6' },
    { value: '7', id: '7D', suit: 'D' },
    { suit: 'H', id: '5H', value: '5' },
    { suit: 'D', id: '3D', value: '3' },
    { suit: 'D', id: 'JD', value: 'J' },
    { id: '4C', suit: 'C', value: '4' },
  ],
  burnt: [
    { id: 'QD', value: 'Q', suit: 'D' },
    { suit: 'C', id: 'KC', value: 'K' },
  ],
  pickupPile: [],
  turnLocks: [],
  afterimage: [{ suit: 'C', id: 'KC', value: 'K' }],
  local: { targetUID: '', faceUpPickID: '' },
  stackEffect: 'steal',
  activeSteal: {
    reciprocatedSteals: 0,
    participants: [],
    targeting: false,
    userSteals: 0,
  },
  focused: '',
}

export const chained: GameState = {
  direction: 1,
  burning: false,
  animating: false,
  queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2'],
  players: [
    {
      id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      faction: 0,
      displayName: 'kjshsjk',
      cards: [
        { card: { suit: 'C', value: 'Q', id: 'QC' }, tier: 0 },
        { card: { suit: 'H', value: '6', id: '6H' }, tier: 0 },
        { card: { suit: 'H', value: '10', id: '10H' }, tier: 1 },
        { card: { suit: 'D', value: '10', id: '10D' }, tier: 1 },
        { card: { suit: 'C', value: '2', id: '2C' }, tier: 1 },
        { card: { suit: 'D', value: '9', id: '9D' }, tier: 1 },
        { card: { suit: 'H', value: '5', id: '5H' }, tier: 2 },
        { card: { suit: 'H', value: '9', id: '9H' }, tier: 2 },
      ],
    },
    {
      id: 'Jj2c3OMxphY26S1k3qQwB0LCiQ43',
      displayName: 'hhbkh',
      faction: 1,
      cards: [
        { card: { suit: 'H', value: '4', id: '4H' }, tier: 0 },
        { card: { suit: 'S', value: 'A', id: 'AS' }, tier: 0 },
        { card: { suit: 'C', value: '6', id: '6C' }, tier: 0 },
        { card: { suit: 'S', value: '8', id: '8S' }, tier: 1 },
        { card: { suit: 'D', value: 'J', id: 'JD' }, tier: 1 },
        { card: { suit: 'D', value: 'A', id: 'AD' }, tier: 1 },
        { card: { suit: 'C', value: '9', id: '9C' }, tier: 2 },
        { card: { suit: 'C', value: '5', id: '5C' }, tier: 2 },
        { card: { suit: 'D', value: '6', id: '6D' }, tier: 2 },
        { card: { suit: 'C', value: '3', id: '3C' }, tier: 2 },
      ],
    },
  ],
  stack: [createCardByID('3S')],
  burnt: [
    { suit: 'H', value: 'Q', id: 'QH' },
    { suit: 'D', value: 'Q', id: 'QD' },
    { suit: 'S', value: 'Q', id: 'QS' },
  ],
  pickupPile: [
    { suit: 'H', value: 'A', id: 'AH' },
    { suit: 'D', value: '4', id: '4D' },
    { suit: 'D', value: '3', id: '3D' },
    { suit: 'C', value: '8', id: '8C' },
    { suit: 'S', value: '2', id: '2S' },
    { suit: 'H', value: 'J', id: 'JH' },
    { suit: 'C', value: 'J', id: 'JC' },
  ],
  turnLocks: ['user:replenish', 'user:psychicreveal'],
  afterimage: [],
  local: { targetUID: '', faceUpPickID: '' },
  stackEffect: 'psychic',
  activeSteal: {
    participants: [],
    userSteals: 0,
    reciprocatedSteals: 0,
  },
  focused: '',
}

export const chainedKing: GameState = {
  ...chained,
  pendingChains: [],
  players: [
    {
      id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      faction: 0,
      displayName: 'kjshsjk',
      cards: [
        { card: { suit: 'C', value: 'K', id: 'KC' }, tier: 0 },
        { card: { suit: 'H', value: 'Q', id: 'QH' }, tier: 0 },
        { card: { suit: 'H', value: '10', id: '10H' }, tier: 1 },
        { card: { suit: 'D', value: '10', id: '10D' }, tier: 1 },
        { card: { suit: 'C', value: '2', id: '2C' }, tier: 1 },
        { card: { suit: 'D', value: '9', id: '9D' }, tier: 1 },
        { card: { suit: 'H', value: '5', id: '5H' }, tier: 2 },
        { card: { suit: 'H', value: '9', id: '9H' }, tier: 2 },
      ],
    },
    {
      id: 'Jj2c3OMxphY26S1k3qQwB0LCiQ43',
      displayName: 'hhbkh',
      faction: 1,
      cards: [
        { card: { suit: 'H', value: 'K', id: 'KH' }, tier: 2 },
        { card: { suit: 'C', value: 'Q', id: 'QC' }, tier: 2 },
        { card: { suit: 'H', value: '4', id: '4H' }, tier: 0 },
        { card: { suit: 'S', value: 'A', id: 'AS' }, tier: 0 },
        { card: { suit: 'C', value: '6', id: '6C' }, tier: 0 },
        { card: { suit: 'S', value: '8', id: '8S' }, tier: 1 },
        { card: { suit: 'D', value: 'J', id: 'JD' }, tier: 1 },
        { card: { suit: 'D', value: 'A', id: 'AD' }, tier: 1 },
        { card: { suit: 'C', value: '5', id: '5C' }, tier: 2 },
        { card: { suit: 'D', value: '6', id: '6D' }, tier: 2 },
      ],
    },
  ],
}

export const quaddies: GameState = {
  direction: 1,
  burning: false,
  animating: false,
  queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2'],
  players: [
    {
      id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
      faction: 0,
      displayName: 'kjshsjk',
      cards: [
        { card: { suit: 'C', value: 'Q', id: 'QC' }, tier: 0 },
        { card: { suit: 'H', value: '6', id: '6H' }, tier: 0 },
        { card: { suit: 'H', value: '10', id: '10H' }, tier: 1 },
        { card: { suit: 'D', value: '10', id: '10D' }, tier: 1 },
        { card: { suit: 'C', value: '2', id: '2C' }, tier: 1 },
        { card: { suit: 'D', value: '9', id: '9D' }, tier: 1 },
        { card: { suit: 'C', value: '8', id: '8C' }, tier: 2 },
        { card: { suit: 'H', value: '8', id: '8H' }, tier: 2 },
        { card: { suit: 'S', value: '8', id: '8S' }, tier: 2 },

        { card: { suit: 'D', value: '8', id: '8D' }, tier: 2 },
      ],
    },
    {
      id: 'Jj2c3OMxphY26S1k3qQwB0LCiQ43',
      displayName: 'hhbkh',
      faction: 1,
      cards: [
        { card: { suit: 'H', value: '4', id: '4H' }, tier: 0 },
        { card: { suit: 'S', value: 'A', id: 'AS' }, tier: 0 },
        { card: { suit: 'C', value: '6', id: '6C' }, tier: 0 },
        { card: { suit: 'D', value: 'J', id: 'JD' }, tier: 1 },
        { card: { suit: 'D', value: 'A', id: 'AD' }, tier: 1 },
        { card: { suit: 'C', value: '9', id: '9C' }, tier: 2 },
        { card: { suit: 'C', value: '5', id: '5C' }, tier: 2 },
        { card: { suit: 'D', value: '6', id: '6D' }, tier: 2 },
        { card: { suit: 'C', value: '3', id: '3C' }, tier: 2 },
      ],
    },
  ],
  stack: [],
  burnt: [
    { suit: 'H', value: 'Q', id: 'QH' },
    { suit: 'D', value: 'Q', id: 'QD' },
    { suit: 'S', value: 'Q', id: 'QS' },
  ],
  pickupPile: [],
  turnLocks: [],
  afterimage: [
    { suit: 'H', value: 'Q', id: 'QH' },
    { suit: 'D', value: 'Q', id: 'QD' },
    { suit: 'S', value: 'Q', id: 'QS' },
  ],
  local: { targetUID: '', faceUpPickID: '' },
  stackEffect: 'psychic',
  activeSteal: {
    participants: [],
    userSteals: 0,
    reciprocatedSteals: 0,
  },
  focused: '',
}
