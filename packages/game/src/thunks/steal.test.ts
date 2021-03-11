import it from 'ava'
import {
  stealSingleCard,
  getStore,
  userModeSelector,
  highlightedLocationSelector,
} from '..'
import { createCard, createCardByID } from '../deck'
import { hasLock } from '../selectors'
import { gameModeSelector } from '../selectors/status'
import { playCardThunk } from './play'

const isStealTargeting = hasLock('steal:target')
const isStealing = hasLock('steal:selectcards')
const isReciprocatingSteal = hasLock('steal:reciprocate')

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

  t.is(isStealTargeting(store.getState()), true)
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
    turnLocks: ['steal:selectcards'],
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
    turnLocks: ['steal:reciprocate'],
    activeSteal: {
      participants: ['a', 'b'],
      userSteals: 0,
      reciprocatedSteals: 1,
    },
  })

  store.dispatch(stealSingleCard({ cardID: '3C', userID: 'b' }))
  t.is(isReciprocatingSteal(store.getState()), false)
  t.is(isStealing(store.getState()), false)
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
