import it from 'ava'
import { createCard } from '../deck'
import { getDummyState } from '../rules/_test.helpers'
import { modeSelector } from './status'

it('is in the lobby when only one player present', (t) => {
  const mode = modeSelector({
    burnt: [],
    direction: 0,
    pickupPile: [],
    queue: [],
    stack: [],
    players: [{ id: 'a', faction: 0, cards: [] }],
  })

  t.is(mode, 'lobby')
})

it('is in the lobby when players are not divided into factions', (t) => {
  const mode = modeSelector({
    burnt: [],
    direction: 0,
    pickupPile: [],
    queue: [],
    stack: [],
    players: [
      { id: 'a', faction: 0, cards: [] },
      { id: 'b', faction: -1, cards: [] },
    ],
  })

  t.is(mode, 'lobby')
})

it('is in a valid lobby when 4 players are in 2 factions and no cards are dealt', (t) => {
  const mode = modeSelector({
    burnt: [],
    direction: 0,
    pickupPile: [],
    queue: [],
    stack: [],
    players: [
      { id: 'a', faction: 0, cards: [] },
      { id: 'b', faction: 0, cards: [] },
      { id: 'c', faction: 1, cards: [] },
      { id: 'd', faction: 1, cards: [] },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is a valid lobby when players are split in 2 factions', (t) => {
  const mode = modeSelector({
    ...getDummyState(),
    players: [
      { id: 'a', faction: 1, cards: [] },
      { id: 'b', faction: 1, cards: [] },
      { id: 'c', faction: 2, cards: [] },
      { id: 'd', faction: 2, cards: [] },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is able to start when 4 players are in 4 factions', (t) => {
  const mode = modeSelector({
    burnt: [],
    direction: 0,
    pickupPile: [],
    queue: [],
    stack: [],
    players: [
      { id: 'a', faction: 0, cards: [] },
      { id: 'b', faction: 1, cards: [] },
      { id: 'c', faction: 2, cards: [] },
      { id: 'd', faction: 3, cards: [] },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is running when the cards are dealt', (t) => {
  const card = createCard('3', 'C')
  const mode = modeSelector({
    burnt: [],
    direction: 0,
    pickupPile: [],
    queue: [],
    stack: [],
    players: [
      { id: 'a', faction: 0, cards: [{ card, tier: 0 }] },
      { id: 'b', faction: 1, cards: [{ card, tier: 0 }] },
      { id: 'c', faction: 2, cards: [{ card, tier: 0 }] },
      { id: 'd', faction: 3, cards: [{ card, tier: 0 }] },
    ],
  })

  t.is(mode, 'running')
})
