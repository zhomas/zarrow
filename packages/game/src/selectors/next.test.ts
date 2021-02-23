import it from 'ava'
import { GameState, getNextPlayer } from '..'

it('proceeds to the next player after a psychic reveal', (t) => {
  const state: GameState = {
    direction: -1,
    queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2'],
    players: [
      {
        id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
        displayName: 'gfdfgfd',
        cards: [
          {
            card: {
              suit: 'H',
              value: '9',
              id: '9H',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'H',
              value: '5',
              id: '5H',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'C',
              value: '9',
              id: '9C',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'C',
              value: '4',
              id: '4C',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'H',
              value: '10',
              id: '10H',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'S',
              value: '7',
              id: '7S',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'D',
              value: 'Q',
              id: 'QD',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'H',
              value: '6',
              id: '6H',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'D',
              value: '4',
              id: '4D',
            },
            tier: 2,
          },
          {
            card: {
              suit: 'C',
              value: '8',
              id: '8C',
            },
            tier: 2,
          },
          {
            card: {
              suit: 'C',
              value: 'K',
              id: 'KC',
            },
            tier: 2,
          },
          {
            card: {
              suit: 'C',
              value: 'J',
              id: 'JC',
            },
            tier: 1,
          },
        ],
        faction: 0,
      },
      {
        cards: [
          {
            card: {
              suit: 'C',
              value: '5',
              id: '5C',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'D',
              value: '3',
              id: '3D',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'H',
              value: 'A',
              id: 'AH',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'H',
              value: '2',
              id: '2H',
            },
            tier: 0,
          },
          {
            card: {
              suit: 'C',
              value: 'A',
              id: 'AC',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'S',
              value: '6',
              id: '6S',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'D',
              value: '7',
              id: '7D',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'S',
              value: '2',
              id: '2S',
            },
            tier: 1,
          },
          {
            card: {
              suit: 'S',
              value: '3',
              id: '3S',
            },
            tier: 2,
          },
          {
            card: {
              suit: 'S',
              value: '10',
              id: '10S',
            },
            tier: 2,
          },
          {
            card: {
              suit: 'D',
              value: 'J',
              id: 'JD',
            },
            tier: 2,
          },
          {
            card: {
              suit: 'D',
              value: '8',
              id: '8D',
            },
            tier: 2,
          },
        ],
        faction: 1,
        id: 'veCwfxLSOXRjyxxZD38OxQY9uEQ2',
        displayName: 'hjghjghj',
      },
    ],
    stack: [],
    burnt: [
      {
        suit: 'C',
        value: 'Q',
        id: 'QC',
      },
    ],
    pickupPile: [],
    turnLocks: [],
    local: {
      targetUID: '',
      faceUpPickID: '',
    },
    turnClocks: [],
    focused: '',
  }

  const next = getNextPlayer(state)

  t.is(next, 'veCwfxLSOXRjyxxZD38OxQY9uEQ2')
})
