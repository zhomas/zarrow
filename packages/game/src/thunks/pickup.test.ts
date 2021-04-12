import it from 'ava'
import { activePlayerSelector, getStore } from '..'
import { createCard } from '../deck'
import { pickupThunk } from './pickup'

it('resolves the players when I pick up from myself', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        cards: [{ card: createCard('3', 'D'), tier: 0 }],
        displayName: '',
        faction: 0,
      },
      {
        id: 'b',
        cards: [{ card: createCard('4', 'D'), tier: 0 }],
        displayName: '',
        faction: 1,
      },
    ],
    focused: '3D',
  })

  const action = pickupThunk()

  await store.dispatch(action)

  t.is(activePlayerSelector(store.getState()).id, 'b')
})

it('prompts a FUPU when picking up from face ups', (t) => {
  const { dispatch, getState } = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        cards: [
          { card: createCard('3', 'D'), tier: 0 },
          { card: createCard('4', 'D'), tier: 1 },
          { card: createCard('6', 'D'), tier: 1 },
        ],
        displayName: '',
        faction: 0,
      },
      {
        id: 'b',
        cards: [{ card: createCard('4', 'D'), tier: 0 }],
        displayName: '',
        faction: 1,
      },
    ],
  })

  dispatch(pickupThunk())

  const st = getState()

  t.truthy(st.turnLocks.includes('user:faceuptake'))
})

it('prompts no FUPU when all face ups share value', (t) => {
  const { dispatch, getState } = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        cards: [
          { card: createCard('3', 'D'), tier: 0 },
          { card: createCard('4', 'D'), tier: 1 },
          { card: createCard('4', 'H'), tier: 1 },
        ],
        displayName: '',
        faction: 0,
      },
      {
        id: 'b',
        cards: [{ card: createCard('5', 'D'), tier: 0 }],
        displayName: '',
        faction: 1,
      },
    ],
  })

  dispatch(pickupThunk())

  const st = getState()

  t.falsy(st.turnLocks.includes('user:faceuptake'))
  t.deepEqual(st.players[0].cards, [
    { card: createCard('3', 'D'), tier: 0 },
    { card: createCard('4', 'D'), tier: 2 },
    { card: createCard('4', 'H'), tier: 2 },
  ])
})
