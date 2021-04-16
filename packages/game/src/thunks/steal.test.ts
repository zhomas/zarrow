import it from 'ava'
import { stealSingleCard, getStore, stealPhaseSelector, GameState } from '..'
import { createCard, createCardByID } from '../deck'
import { hasLock } from '../selectors'
import { playCardThunk } from './play'
import { stealCardThunk } from './steal'

const isStealTargeting = (s: GameState) => stealPhaseSelector(s) === 'target'
const isReciprocatingSteal = (state: GameState) =>
  stealPhaseSelector(state) === 'reciprocate'

it('blocks the turn when a king is played', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('K', 'C'), tier: 2 },
          { card: createCard('2', 'C'), tier: 0 },
        ],
      },
    ],
  })

  store.dispatch(
    playCardThunk({
      cards: [createCard('K', 'C')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  t.is(stealPhaseSelector(store.getState()), 'target')
  t.log(store.getState())
})

it('adds cards to the active steal', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('K', 'C'), tier: 2 },
          { card: createCard('2', 'C'), tier: 0 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [
          { card: createCard('2', 'H'), tier: 2 },
          { card: createCard('2', 'C'), tier: 0 },
        ],
      },
    ],
    turnLocks: [],
    activeSteal: {
      participants: ['a', 'b'],
      userSteals: 1,
      reciprocatedSteals: 1,
    },
  })

  store.dispatch(stealSingleCard({ cardID: '2H', userID: 'a' }))

  t.deepEqual(store.getState().players, [
    {
      id: 'a',
      faction: 0,
      displayName: '',
      cards: [
        { card: createCard('K', 'C'), tier: 2 },
        { card: createCard('2', 'C'), tier: 0 },
        { card: createCard('2', 'H'), tier: 2, stolen: true },
      ],
    },
    {
      id: 'b',
      faction: 1,
      displayName: '',
      cards: [{ card: createCard('2', 'C'), tier: 0 }],
    },
  ])

  t.deepEqual(store.getState().activeSteal, {
    participants: ['a', 'b'],
    userSteals: 0,
    reciprocatedSteals: 1,
  })
})

it('concludes the steal after reciprocation', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card: createCard('3', 'C'), tier: 2 }],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [{ card: createCard('2', 'H'), tier: 2 }],
      },
    ],
    turnLocks: [],
    activeSteal: {
      participants: ['a', 'b'],
      userSteals: 0,
      reciprocatedSteals: 1,
    },
  })

  store.dispatch(stealSingleCard({ cardID: '3C', userID: 'b' }))
  t.is(isReciprocatingSteal(store.getState()), false)
  t.is(stealPhaseSelector(store.getState()), 'none')
  t.deepEqual(store.getState().players, [
    {
      id: 'a',
      faction: 0,
      displayName: '',
      cards: [],
    },
    {
      id: 'b',
      faction: 1,
      displayName: '',
      cards: [
        { card: createCard('2', 'H'), tier: 2 },
        { card: createCard('3', 'C'), tier: 2, stolen: true },
      ],
    },
  ])
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
          { card: createCard('3', 'C'), tier: 2 },
          { card: createCard('K', 'D'), tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [{ card: createCard('2', 'H'), tier: 2 }],
      },
    ],
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('K', 'D')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  store.dispatch(stealSingleCard({ cardID: '2H', userID: 'a' }))
  store.dispatch(stealSingleCard({ cardID: '3C', userID: 'b' }))

  await x

  t.falsy(store.getState().stack.some((c) => c.id === 'KD'))
  t.truthy(store.getState().burnt.some((c) => c.id === 'KD'))
  t.truthy(store.getState().afterimage.some((c) => c.id === 'KD'))
  t.log(store.getState().burnt)
})

it('chains another king', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('3', 'C'), tier: 2 },
          { card: createCard('K', 'D'), tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',

        cards: [
          { card: createCard('2', 'H'), tier: 2 },
          { card: createCard('K', 'H'), tier: 2 },
        ],
      },
    ],
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('K', 'D')],
      playerID: 'a',
    }),
  )

  await new Promise((r) => setTimeout(r, 1000))

  store.dispatch(stealCardThunk({ cardID: 'KH', playerID: 'a' }))
  store.dispatch(stealCardThunk({ cardID: '3C', playerID: 'b' }))

  await x

  t.is(store.getState().activeSteal.userSteals, 1)
})

it('increments the turn after a steal', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('3', 'C'), tier: 2 },
          { card: createCard('K', 'D'), tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 1,
        displayName: '',
        cards: [{ card: createCard('2', 'H'), tier: 2 }],
      },
    ],
    pickupPile: [createCardByID('JD'), createCardByID('4C')],
  })

  const x = store.dispatch(
    playCardThunk({
      cards: [createCard('K', 'D')],
      playerID: 'a',
    }),
  )

  store.dispatch(stealSingleCard({ cardID: '2H', userID: 'a' }))
  store.dispatch(stealSingleCard({ cardID: '3C', userID: 'b' }))

  await x

  t.truthy(store.getState().queue[0], 'b')
})
