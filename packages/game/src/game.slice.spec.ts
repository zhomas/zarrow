import reducer, { activeTierSelector, playCardThunk } from './game.slice'
import it from 'ava'
import { CardModel } from './types'
import { createCard } from './deck'
import {
  activePlayerSelector,
  confirmReplenish,
  confirmTargeting,
  GameState,
  getStore,
  stackDestinationSelector,
} from '.'
import { userModeSelector } from './selectors'

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

it('moves to the next player when I play a card', (t) => {
  const store = getStore({
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
    stack: [],
  })

  const action = playCardThunk({ cards: [card] })
  store.dispatch(action)
  const state = store.getState()
  t.is(activePlayerSelector(state).id, 'b')
})

it('replenishes cards', async (t) => {
  const store = getStore({
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card, tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
    pickupPile: [card, card, card, card],
    stack: [card, card],
  })

  await store.dispatch(playCardThunk({ cards: [card] }))
  const state = store.getState()
  t.is(activePlayerSelector(state).id, 'a')
  t.is(state.turnPhase, 'user:replenish')

  store.dispatch(confirmReplenish())

  t.is(store.getState().players[0].cards.length, 4)
})

it('skips a go', (t) => {
  const store = getStore({
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card, tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
    stack: [],
  })

  const action = playCardThunk({ cards: [createCard('5', 'D')] })
  store.dispatch(action)
  const state = store.getState()
  t.is(activePlayerSelector(state).id, 'a')
})

it('skips a go in reverse', (t) => {
  const { dispatch, getState } = getStore({
    direction: -1,
    pickupPile: [],
    burnt: [],
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'c',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    stack: [],
  })

  dispatch(playCardThunk({ cards: [createCard('5', 'H')] }))
  t.is(activePlayerSelector(getState()).id, 'b')
})

it('marks the turn as fresh', async (t) => {
  const { dispatch, getState } = getStore({
    direction: -1,
    pickupPile: [],
    burnt: [],
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    stack: [],
    turnIsFresh: false,
  })

  await dispatch(playCardThunk({ cards: [createCard('5', 'H')] }))
  t.is(getState().turnIsFresh, true)
})

it('burns the stack when a 10 is played', async (t) => {
  const action = playCardThunk({ cards: [createCard('10', 'D')] })
  const store = getStore(state)
  store.dispatch(action)
  t.is(store.getState().idleBurn, true)
  await new Promise((resolve) => setTimeout(resolve, 3500))
  t.is(store.getState().idleBurn, false)
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

it('properly increments the turn when I play an ace', async (t) => {
  const data: GameState = {
    stack: [],
    players: [
      {
        cards: [
          { tier: 2, card: { suit: 'C', id: 'KC', value: 'K' } },
          { tier: 2, card: { suit: 'H', id: 'AH', value: 'A' } },
        ],
        displayName: 'bbnmnb',
        faction: 0,
        id: 'a',
      },
      {
        cards: [
          { tier: 2, card: { suit: 'D', id: '8D', value: '8' } },
          { tier: 2, card: { suit: 'D', id: '8D', value: '8' } },
          { tier: 2, card: { suit: 'D', id: '8D', value: '8' } },
          { tier: 2, card: { suit: 'D', id: '8D', value: '8' } },
        ],
        displayName: 'bmnbmnb',
        faction: 1,
        id: 'b',
      },
    ],
    turnIsFresh: true,
    idleBurn: false,
    pickupPile: [{ suit: 'H', id: '6H', value: '6' }],
    focused: '',
    burnt: [],
    queue: ['a'],
    direction: -1,
  }

  const store = getStore(data)
  store.dispatch(confirmTargeting('b'))
  await store.dispatch(playCardThunk({ cards: [createCard('A', 'H')] }))
  t.is(store.getState().queue[0], 'b')
})

it('allows me to pick up when I ace someone', async (t) => {
  const store = getStore({
    players: [
      {
        cards: [
          { tier: 2, card: { suit: 'C', id: 'KC', value: 'K' } },
          { tier: 2, card: { suit: 'H', id: 'AH', value: 'A' } },
        ],
        displayName: 'bbnmnb',
        faction: 0,
        id: 'a',
      },
      {
        cards: [{ tier: 2, card: { suit: 'D', id: '3D', value: '3' } }],
        displayName: 'bmnbmnb',
        faction: 1,
        id: 'b',
      },
    ],
    pickupPile: [{ suit: 'H', id: '6H', value: '6' }],
    queue: ['a'],
    direction: -1,
  })

  store.dispatch(confirmTargeting('b'))
  await store.dispatch(playCardThunk({ cards: [createCard('A', 'H')] }))

  t.is(store.getState().turnPhase, 'user:replenish')
})

it('can play a 6 on an empty stack', async (t) => {
  const store = getStore({
    stack: [],
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
  })

  await store.dispatch(playCardThunk({ cards: [createCard('6', 'H')] }))
  t.is(store.getState().stack.length, 1)
})

it('cannot play a 3 on a 4', async (t) => {
  const store = getStore({
    stack: [createCard('4', 'S')],
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
  })

  await store.dispatch(playCardThunk({ cards: [createCard('3', 'H')] }))
  t.is(store.getState().stack.length, 1)
})

it('treats 8s as invisible', async (t) => {
  const { getState, dispatch } = getStore({
    stack: [createCard('8', 'D'), createCard('3', 'S')],
  })

  await dispatch(playCardThunk({ cards: [createCard('8', 'H')] }))

  t.is(stackDestinationSelector(getState()).id, '3S')

  //   addToStack(state, card)
  //   t.is(state.stack.length, 3)
})

it('reverses direction when a 7 is played', async (t) => {
  const store = getStore({
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'c',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'd',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
    direction: 1,
  })

  await store.dispatch(playCardThunk({ cards: [createCard('7', 'D')] }))
  t.is(store.getState().direction, -1)
  t.is(activePlayerSelector(store.getState()).id, 'd')
})

it('preserves direction when a double whacky 7 is played', async (t) => {
  const store = getStore({
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'c',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'd',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    direction: 1,
  })

  await store.dispatch(
    playCardThunk({ cards: [createCard('7', 'D'), createCard('7', 'H')] }),
  )
  t.is(store.getState().direction, 1)
})

it('reverses direction when a triple whacky 7 is played', async (t) => {
  const store = getStore({
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'c',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
      {
        id: 'd',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    direction: 1,
  })

  await store.dispatch(
    playCardThunk({
      cards: [createCard('7', 'D'), createCard('7', 'H'), createCard('7', 'C')],
    }),
  )
  t.is(store.getState().direction, -1)
})

it('cannot play a QC on a JD', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
  })

  await store.dispatch(playCardThunk({ cards: [createCard('Q', 'C')] }))
  t.is(store.getState().stack.length, 1)
})

it('can play a 3D on a JD', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card: createCard('3', 'D'), tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
  })

  await store.dispatch(playCardThunk({ cards: [createCard('3', 'D')] }))
  t.is(store.getState().stack.length, 2)
  t.log(store.getState())
})

it('can play a 2D on a JD', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card: createCard('2', 'D'), tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
  })

  await store.dispatch(playCardThunk({ cards: [createCard('2', 'D')] }))
  t.is(store.getState().stack.length, 2)
})

it('plays only the siblings that match', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('2', 'D'), tier: 2 },
          { card: createCard('2', 'H'), tier: 2 },
          { card: createCard('2', 'S'), tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
  })

  await store.dispatch(
    playCardThunk({
      cards: [createCard('2', 'D'), createCard('2', 'H'), createCard('2', 'S')],
    }),
  )

  t.is(store.getState().players[0].cards.length, 2)
  t.is(store.getState().stack.length, 2)
})

it('hangs the turn if there is a pickup pile', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card: createCard('9', 'D'), tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
    pickupPile: [card, card, card, card, card],
  })

  store.dispatch(playCardThunk({ cards: [createCard('9', 'D')] }))
  t.is(store.getState().stack.length, 2)
  t.is(store.getState().turnPhase, 'user:replenish')
})

it('doesnt hang the turn if there is no pickup pile', async (t) => {
  const { dispatch, getState } = getStore({
    stack: [createCard('J', 'D')],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [{ card: createCard('3', 'D'), tier: 2 }],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    queue: ['a'],
    pickupPile: [],
  })

  await dispatch(playCardThunk({ cards: [createCard('3', 'D')] }))
  t.is(activePlayerSelector(getState()).id, 'b')
})

it('doesnt hang the turn if the player has more than 4 cards', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    players: [
      {
        id: 'a',
        faction: 0,
        displayName: '',
        cards: [
          { card: createCard('3', 'D'), tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
          { card, tier: 2 },
        ],
      },
      {
        id: 'b',
        faction: 0,
        displayName: '',
        cards: [{ card, tier: 2 }],
      },
    ],
    pickupPile: [card, card, card, card, card],
  })

  store.dispatch(playCardThunk({ cards: [createCard('3', 'D')] }))
  t.not(store.getState().turnPhase, 'user:replenish')
})
