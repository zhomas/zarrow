import it from 'ava'
import { createCard } from '../deck'
import { PlayerModel } from '../types'
import { getSorted } from './sort'

it('sorts a players hand cards', (t) => {
  const player: PlayerModel = {
    cards: [
      { card: createCard('3', 'D'), tier: 2 },
      { card: createCard('A', 'S'), tier: 2 },
      { card: createCard('3', 'H'), tier: 2 },
    ],
    displayName: 'a',
    id: 'b',
    faction: 0,
  }

  const result = getSorted(player)

  t.deepEqual(result.cards, [
    { card: createCard('3', 'D'), tier: 2 },
    { card: createCard('3', 'H'), tier: 2 },
    { card: createCard('A', 'S'), tier: 2 },
  ])
})

it('sorts a players face up cards', (t) => {
  const player: PlayerModel = {
    cards: [
      { card: createCard('3', 'D'), tier: 1 },
      { card: createCard('A', 'S'), tier: 1 },
      { card: createCard('3', 'H'), tier: 1 },
    ],
    displayName: 'a',
    id: 'b',
    faction: 0,
  }

  const result = getSorted(player)

  t.deepEqual(result.cards, [
    { card: createCard('3', 'D'), tier: 1 },
    { card: createCard('3', 'H'), tier: 1 },
    { card: createCard('A', 'S'), tier: 1 },
  ])
})

it('leaves a players face down cards', (t) => {
  const player: PlayerModel = {
    cards: [
      { card: createCard('3', 'D'), tier: 0 },
      { card: createCard('A', 'S'), tier: 0 },
      { card: createCard('3', 'H'), tier: 0 },
    ],
    displayName: 'a',
    id: 'b',
    faction: 0,
  }

  const result = getSorted(player)

  t.deepEqual(result.cards, [
    { card: createCard('3', 'D'), tier: 0 },
    { card: createCard('A', 'S'), tier: 0 },
    { card: createCard('3', 'H'), tier: 0 },
  ])
})
