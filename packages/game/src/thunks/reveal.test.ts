import it from 'ava'
import {
  hasLock,
  getStore,
  unlockTurn,
  activePlayerSelector,
  stackDestinationSelector,
} from '..'
import { createCard, createCardByID } from '../deck'

import { playCardThunk } from './play'
import { revealThunk } from './reveal'

const isQueenLocked = hasLock('user:psychicreveal')

it('blocks the turn when a queen is played', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'C'), tier: 2 },
          { card: createCard('2', 'C'), tier: 0 },
        ],
      },
    ],
  })

  store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(isQueenLocked(store.getState()), true)
})

it('unblocks the turn when a reveal is made', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'C'), tier: 2 },
          { card: createCard('2', 'C'), tier: 0 },
        ],
      },
    ],
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(isQueenLocked(store.getState()), true)

  store.dispatch(unlockTurn({ channel: 'user:psychicreveal' }))

  await x
  t.is(isQueenLocked(store.getState()), false)
})

it('advances to the next player when revaling is complete', async (t) => {
  const store = getStore({
    direction: -1,
    queue: ['NRUF3fQBIvTw8GkKMAoaMH9z6wC2'],
    players: [
      {
        id: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
        displayName: 'gfdfgfd',
        cards: [
          { card: { suit: 'H', value: '9', id: '9H' }, tier: 0 },
          { card: { suit: 'H', value: '5', id: '5H' }, tier: 0 },
          { card: { suit: 'C', value: '9', id: '9C' }, tier: 0 },
          { card: { suit: 'C', value: '4', id: '4C' }, tier: 0 },
          { card: { suit: 'H', value: '10', id: '10H' }, tier: 1 },
          { card: { suit: 'S', value: '7', id: '7S' }, tier: 1 },
          { card: { suit: 'D', value: 'Q', id: 'QD' }, tier: 1 },
          { card: { suit: 'H', value: '6', id: '6H' }, tier: 1 },
          { card: { suit: 'D', value: '4', id: '4D' }, tier: 2 },
          { card: { suit: 'C', value: '8', id: '8C' }, tier: 2 },
          { card: { suit: 'C', value: 'K', id: 'KC' }, tier: 2 },
          { card: createCardByID('JC'), tier: 0 },
          { card: createCardByID('QC'), tier: 2 },
        ],
        faction: 0,
      },
      {
        cards: [
          { card: { suit: 'C', value: '5', id: '5C' }, tier: 0 },
          { card: { suit: 'D', value: '3', id: '3D' }, tier: 0 },
          { card: { suit: 'H', value: 'A', id: 'AH' }, tier: 0 },
          { card: { suit: 'H', value: '2', id: '2H' }, tier: 0 },
          { card: { suit: 'C', value: 'A', id: 'AC' }, tier: 1 },
          { card: { suit: 'S', value: '6', id: '6S' }, tier: 1 },
          { card: { suit: 'D', value: '7', id: '7D' }, tier: 1 },
          { card: { suit: 'S', value: '2', id: '2S' }, tier: 1 },
          { card: { suit: 'S', value: '3', id: '3S' }, tier: 2 },
          { card: { suit: 'S', value: '10', id: '10S' }, tier: 2 },
          { card: { suit: 'D', value: 'J', id: 'JD' }, tier: 2 },
          { card: { suit: 'D', value: '8', id: '8D' }, tier: 2 },
        ],
        faction: 1,
        id: 'veCwfxLSOXRjyxxZD38OxQY9uEQ2',
        displayName: 'hjghjghj',
      },
    ],
    stack: [],
    burnt: [],
    pickupPile: [],
    turnLocks: [],
    local: { targetUID: '', faceUpPickID: '' },
    turnClocks: [],
    focused: '',
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C')],
      playerID: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(isQueenLocked(store.getState()), true)

  await store.dispatch(
    revealThunk({
      cards: [createCardByID('JC')],
      playerID: 'NRUF3fQBIvTw8GkKMAoaMH9z6wC2',
    }),
  )

  await x

  t.is(
    activePlayerSelector(store.getState()).id,
    'veCwfxLSOXRjyxxZD38OxQY9uEQ2',
  )
})

it('does not resolve the block if the card is not in my downs', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card: createCard('2', 'C'), tier: 0 }],
      },
    ],
    turnLocks: ['user:psychicreveal'],
  })

  await new Promise((r) => setTimeout(r, 1000))

  store.dispatch(unlockTurn({ channel: 'user:psychicreveal', data: 'JD' }))
  t.is(isQueenLocked(store.getState()), true)
})

it('moves the revealed card to a higher tier', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'C'), tier: 2 },
          { card: createCard('3', 'C'), tier: 0 },
        ],
      },
    ],
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(isQueenLocked(store.getState()), true)

  store.dispatch(unlockTurn({ channel: 'user:psychicreveal', data: '3C' }))

  await x

  const thr = store.getState().players[0].cards.find((c) => c.card.id === '3C')

  t.is(thr.tier, 1)
})

it('moves the revealed card to the last card in a players ups', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('A', 'H'), tier: 0 },
          { card: createCard('2', 'C'), tier: 1 },
          { card: createCard('3', 'C'), tier: 1 },
          { card: createCard('4', 'C'), tier: 1 },
          { card: createCard('5', 'C'), tier: 1 },
        ],
      },
    ],
    turnLocks: ['user:psychicreveal'],
  })

  const action = revealThunk({
    cards: [createCardByID('AH')],
    playerID: 'a',
  })

  await store.dispatch(action)

  const cards = store.getState().players[0].cards

  t.is(cards[cards.length - 1].card.id, 'AH')
})

it('does not activate the queen magic when you have no face-downs', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'C'), tier: 2 },
          { card: createCard('3', 'C'), tier: 1 },
        ],
      },
    ],
  })

  store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(isQueenLocked(store.getState()), false)
})

it('burns after use', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'C'), tier: 2 },
          { card: createCard('3', 'C'), tier: 0 },
        ],
      },
    ],
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(isQueenLocked(store.getState()), true)

  store.dispatch(unlockTurn({ channel: 'user:psychicreveal', data: '3C' }))

  await x

  t.falsy(store.getState().stack.some((c) => c.id === 'QC'))
  t.truthy(store.getState().burnt.some((c) => c.id === 'QC'))
  t.truthy(store.getState().afterimage.some((c) => c.id === 'QC'))

  t.is(stackDestinationSelector(store.getState()).id, 'QC')
})

it('performs a double block when two queens are played', async (t) => {
  const isQueenLocked = hasLock('user:psychicreveal')
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'C'), tier: 2 },
          { card: createCard('Q', 'H'), tier: 2 },
          { card: createCard('2', 'C'), tier: 0 },
          { card: createCard('2', 'H'), tier: 0 },
        ],
      },
    ],
  })

  store.dispatch(
    playCardThunk({
      cards: [createCard('Q', 'C'), createCard('Q', 'H')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  store.dispatch(unlockTurn({ channel: 'user:psychicreveal', data: '2C' }))

  t.is(isQueenLocked(store.getState()), true)

  store.dispatch(unlockTurn({ channel: 'user:psychicreveal', data: '2H' }))

  t.is(isQueenLocked(store.getState()), false)
})

it('chains when a queen is revealed', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
    ],
    turnLocks: ['user:psychicreveal'],
  })

  await store.dispatch(
    revealThunk({ cards: [createCard('Q', 'H')], playerID: 'a' }),
  )

  const state = store.getState()

  t.is(
    state.players[0].cards.some((c) => c.card.id === 'QH' && c.tier === 1),
    true,
  )

  t.is(isQueenLocked(store.getState()), true)
})

it('reveals when its my turn', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
    ],
    turnLocks: ['user:psychicreveal'],
  })

  await store.dispatch(
    revealThunk({
      cards: [createCard('J', 'S')],
      playerID: 'a',
    }),
  )

  const ups = store.getState().players[0].cards.filter((c) => c.tier === 1)
    .length

  t.is(ups, 1)
})

it('advances to the next player once I complete a reveal', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
    ],
  })

  const play = playCardThunk({ cards: [createCard('Q', 'H')], playerID: 'a' })
  const reveal = revealThunk({
    cards: [createCard('J', 'S')],
    playerID: 'a',
  })

  const x = store.dispatch(play)
  await new Promise((r) => setTimeout(r, 1000))

  await store.dispatch(reveal)

  await x

  t.is(activePlayerSelector(store.getState()).id, 'b')
})

it('doesnt reveal if no turn lock', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
    ],
    turnLocks: [],
  })

  await store.dispatch(
    revealThunk({
      cards: [createCard('J', 'S')],
      playerID: 'a',
    }),
  )

  const ups = store.getState().players[0].cards.filter((c) => c.tier === 1)
    .length

  t.is(ups, 0)
})

it('doesnt let me reveal if its not my turn', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [
          { card: createCard('Q', 'H'), tier: 0 },
          { card: createCard('J', 'S'), tier: 0 },
        ],
      },
    ],
    turnLocks: ['user:psychicreveal'],
  })

  await store.dispatch(
    revealThunk({
      cards: [createCard('J', 'S')],
      playerID: 'b',
    }),
  )

  t.is(activePlayerSelector(store.getState()).id, 'a')
  t.is(
    store.getState().players[1].cards.every((c) => c.tier === 0),
    true,
  )
  t.is(
    store.getState().players[0].cards.every((c) => c.tier === 0),
    true,
  )
})
