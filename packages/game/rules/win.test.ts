import it from 'ava'
import { createCard } from '../deck'
import { GameState } from '../game.slice'
import { gameStatusSelector, winnersSelector } from './win'

const card = createCard('3', 'S')

it('marks a player as a winner when all cards played', (t) => {
  const state: GameState = {
    factions: [],
    pickupPile: [],
    burnt: [],
    queue: ['a'],
    direction: 1,
    players: [
      {
        id: 'a',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        cards: [{ card, tier: 0 }],
      },
      {
        id: 'c',
        cards: [],
      },
    ],
    stack: [],
  }

  const winners = winnersSelector(state)

  t.deepEqual(winners, ['c'])
})

it('ends the game when all members of a faction are out', (t) => {
  const status = gameStatusSelector({
    factions: [
      ['a', 'b'],
      ['c', 'd'],
    ],
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
        cards: [{ card, tier: 0 }],
      },
      {
        id: 'c',
        cards: [],
      },
      {
        id: 'd',
        cards: [],
      },
    ],
    stack: [],
  })

  t.deepEqual(status, { status: 'complete', winners: ['c', 'd'] })
})
