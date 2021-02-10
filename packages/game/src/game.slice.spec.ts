import reducer, { activeTierSelector, playCardThunk } from './game.slice'
import it from 'ava'
import { CardModel } from './types'
import { createCard } from './deck'
import { activePlayerSelector, getStore } from '.'

it('chooses from the active tier', (t) => {
  const card: CardModel = {
    value: '3',
    suit: 'D',
    id: '',
  }

  const a = activeTierSelector({
    pickupPile: [],
    burnt: [],
    direction: 1,
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card, tier: 0 },
          { card, tier: 0 },
          { card, tier: 1 },
        ],
      },
    ],
    stack: [],
  })

  t.is(a.length, 1)
})

const card = createCard('3', 'D')
const state = {
  pickupPile: [],
  burnt: [],
  direction: 1,
  queue: ['a'],
  players: [
    {
      id: 'a',
      faction: 0,
      displayName: '',
      cards: [
        { card, tier: 0 },
        { card, tier: 0 },
        { card, tier: 1 },
      ],
    },
  ],
  stack: [],
}

it('burns the stack when a 10 is played', async (t) => {
  const action = playCardThunk({ cards: [createCard('10', 'D')] })
  const store = getStore(state)
  store.dispatch(action)
  t.is(store.getState().idleBurn, true)
  await new Promise((resolve) => setTimeout(resolve, 3500))
  t.is(store.getState().idleBurn, false)
})

it('proceeds correctly in a 2 player ace session', (t) => {
  const store = getStore({
    ...state,
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('A', 'H'), tier: 2 },
          { card: createCard('A', 'D'), tier: 2 },
          { card: createCard('2', 'S'), tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('8', 'H'), tier: 2 },
          { card: createCard('8', 'C'), tier: 2 },
          { card: createCard('3', 'S'), tier: 2 },
        ],
      },
    ],
  })

  const a = playCardThunk({
    cards: [createCard('A', 'H'), createCard('A', 'D')],
  })

  store.dispatch(a)
  let st = store.getState()

  t.falsy(st.idleBurn)
  t.is(activePlayerSelector(st).id, 'b')
  t.is(st.players[0].cards.length, 1)

  const b = playCardThunk({
    cards: [createCard('8', 'H'), createCard('8', 'C')],
  })

  store.dispatch(b)
  st = store.getState()

  t.is(activePlayerSelector(st).id, 'a')
  t.is(st.stack.length, 4)
  t.is(st.burnt.length, 0)
})

it('burns when a fourth 8 is played', (t) => {
  const st = {
    ...state,
    stack: [createCard('8', 'C'), createCard('8', 'H'), createCard('8', 'S')],
  }

  const action = playCardThunk({ cards: [createCard('8', 'D')] })
  const store = getStore(st)
  store.dispatch(action)
  t.is(store.getState().idleBurn, true)
})

it('burns when three 8s are played on a fourth', (t) => {
  const st = {
    ...state,
    stack: [createCard('8', 'C')],
  }

  const action = playCardThunk({
    cards: [createCard('8', 'D'), createCard('8', 'H'), createCard('8', 'S')],
  })
  const store = getStore(st)
  store.dispatch(action)
  t.is(store.getState().idleBurn, true)
})

it('burns when four of a kind are added to the stack', (t) => {
  const st = {
    ...state,
    stack: [createCard('3', 'C'), createCard('3', 'H'), createCard('3', 'S')],
  }

  const action = playCardThunk({ cards: [createCard('3', 'D')] })
  const store = getStore(st)
  store.dispatch(action)
  t.is(store.getState().idleBurn, true)
})

it('ignores 8s for four of a kind calculations', (t) => {
  const st = {
    ...state,
    stack: [
      createCard('3', 'C'),
      createCard('8', 'C'),
      createCard('3', 'H'),
      createCard('3', 'S'),
    ],
  }

  const action = playCardThunk({ cards: [createCard('3', 'D')] })
  const store = getStore(st)
  store.dispatch(action)
  t.is(store.getState().idleBurn, true)
})

it('does not burn when 3 of a kind are added to the stack', (t) => {
  const st = {
    ...state,
    stack: [],
  }

  const action = playCardThunk({
    cards: [createCard('3', 'C'), createCard('3', 'H'), createCard('3', 'S')],
  })
  const store = getStore(st)
  store.dispatch(action)
  t.falsy(store.getState().idleBurn)
})
