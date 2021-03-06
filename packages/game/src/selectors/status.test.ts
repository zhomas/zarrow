import it from 'ava'
import { createCard } from '../deck'
import { getDummyState } from '../rules/_test.helpers'
import { gameModeSelector } from './status'

it('is in the lobby when only one player present', (t) => {
  const mode = gameModeSelector({
    burnt: [],
    players: [{ id: 'a', faction: 0, cards: [], displayName: '' }],
  })

  t.is(mode, 'lobby')
})

it('is in the lobby when players are not divided into factions', (t) => {
  const mode = gameModeSelector({
    burnt: [],
    players: [
      { id: 'a', faction: 0, cards: [], displayName: '' },
      { id: 'b', faction: -1, cards: [], displayName: '' },
    ],
  })

  t.is(mode, 'lobby')
})

it('is in a valid lobby when 4 players are in 2 factions and no cards are dealt', (t) => {
  const mode = gameModeSelector({
    burnt: [],
    players: [
      { id: 'a', faction: 0, cards: [], displayName: '' },
      { id: 'b', faction: 0, cards: [], displayName: '' },
      { id: 'c', faction: 1, cards: [], displayName: '' },
      { id: 'd', faction: 1, cards: [], displayName: '' },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is a valid lobby when 2 players are in 2 factions', (t) => {
  const mode = gameModeSelector({
    burnt: [],
    players: [
      {
        cards: [],
        displayName: 'Tom',
        faction: 0,
        id: 'sNb8AvNp8TS9OyRvQhBG07UbAcF2',
      },
      {
        cards: [],
        displayName: 'Barry',
        faction: 1,
        id: 'ILDNBqIXaNbgwDX5Mi07frzhW3g2',
      },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is a valid lobby when players are split in 2 factions', (t) => {
  const mode = gameModeSelector({
    ...getDummyState(),
    players: [
      { id: 'a', faction: 1, cards: [], displayName: '' },
      { id: 'b', faction: 1, cards: [], displayName: '' },
      { id: 'c', faction: 2, cards: [], displayName: '' },
      { id: 'd', faction: 2, cards: [], displayName: '' },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is able to start when 4 players are in 4 factions', (t) => {
  const mode = gameModeSelector({
    burnt: [],
    players: [
      { id: 'a', faction: 0, cards: [], displayName: '' },
      { id: 'b', faction: 1, cards: [], displayName: '' },
      { id: 'c', faction: 2, cards: [], displayName: '' },
      { id: 'd', faction: 3, cards: [], displayName: '' },
    ],
  })

  t.is(mode, 'lobby:valid')
})

it('is running when the cards are dealt', (t) => {
  const card = createCard('3', 'C')
  const mode = gameModeSelector({
    burnt: [],
    players: [
      { id: 'a', faction: 0, cards: [{ card, tier: 0 }], displayName: '' },
      { id: 'b', faction: 1, cards: [{ card, tier: 0 }], displayName: '' },
      { id: 'c', faction: 2, cards: [{ card, tier: 0 }], displayName: '' },
      { id: 'd', faction: 3, cards: [{ card, tier: 0 }], displayName: '' },
    ],
  })

  t.is(mode, 'running')
})
