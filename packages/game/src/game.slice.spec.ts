import { playCardThunk, unlockTurn } from './game.slice'
import {
  activeTierSelector,
  activePlayerSelector,
  stackDestinationSelector,
  hasLock,
} from './selectors'
import it from 'ava'
import { CardModel } from './types'
import { createCard, createCardByID } from './deck'
import { GameState, getStore } from '.'

const isBurning = hasLock('burn')
const isReplenishing = hasLock('user:replenish')

it('chooses from the active tier', (t) => {
  const card: CardModel = {
    value: '3',
    suit: 'D',
    id: '',
  }

  const a = activeTierSelector({
    pickupPile: [],
    turnClocks: [],
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

it('moves to the next player when I play a card', async (t) => {
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

  const action = playCardThunk({ cards: [card], playerID: 'a' })
  await store.dispatch(action)
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

  await store.dispatch(playCardThunk({ cards: [card], playerID: 'a' }))
  const state = store.getState()
  t.is(activePlayerSelector(state).id, 'a')
  t.true(state.turnLocks.includes('user:replenish'))

  store.dispatch(unlockTurn({ channel: 'user:replenish' }))
  t.false(state.turnLocks.includes('user:replenish'))
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

  const action = playCardThunk({ cards: [createCard('5', 'D')], playerID: 'a' })
  store.dispatch(action)
  const state = store.getState()
  t.is(activePlayerSelector(state).id, 'a')
})

it('skips a go in reverse', async (t) => {
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

  await dispatch(
    playCardThunk({ cards: [createCard('5', 'H')], playerID: 'a' }),
  )
  t.is(activePlayerSelector(getState()).id, 'b')
})

it('burns the stack when a 10 is played', async (t) => {
  const action = playCardThunk({
    cards: [createCard('10', 'D')],
    playerID: 'a',
  })
  const store = getStore(state)

  await store.dispatch(action)

  const st = store.getState()
  t.is(st.stack.length, 0)
})

it('burns when a fourth 8 is played', async (t) => {
  const st = {
    ...state,
    stack: [createCard('8', 'C'), createCard('8', 'H'), createCard('8', 'S')],
  }

  const action = playCardThunk({ cards: [createCard('8', 'D')], playerID: 'a' })
  const store = getStore(st)
  await store.dispatch(action)
  t.is(store.getState().stack.length, 0)
  t.is(store.getState().burnt.length, 4)
})

it('burns when three 8s are played on a fourth', async (t) => {
  const st = {
    ...state,
    stack: [createCard('8', 'C')],
  }

  const action = playCardThunk({
    cards: [createCard('8', 'D'), createCard('8', 'H'), createCard('8', 'S')],
    playerID: 'a',
  })
  const store = getStore(st)
  await store.dispatch(action)
  t.is(store.getState().stack.length, 0)
})

it('burns when four of a kind are added to the stack', async (t) => {
  const st = {
    ...state,
    stack: [createCard('3', 'C'), createCard('3', 'H'), createCard('3', 'S')],
  }

  const action = playCardThunk({ cards: [createCard('3', 'D')], playerID: 'a' })
  const store = getStore(st)
  await store.dispatch(action)
  t.is(store.getState().stack.length, 0)
})

it('ignores 8s for four of a kind calculations', async (t) => {
  const st = {
    ...state,
    stack: [
      createCard('3', 'C'),
      createCard('8', 'C'),
      createCard('3', 'H'),
      createCard('3', 'S'),
    ],
  }

  const action = playCardThunk({ cards: [createCard('3', 'D')], playerID: 'a' })
  const store = getStore(st)
  await store.dispatch(action)
  t.is(state.stack.length, 0)
})

it('does not burn when 3 of a kind are added to the stack', (t) => {
  const st = {
    ...state,
    stack: [],
  }

  const action = playCardThunk({
    cards: [createCard('3', 'C'), createCard('3', 'H'), createCard('3', 'S')],
    playerID: 'a',
  })
  const store = getStore(st)
  store.dispatch(action)
  t.falsy(isBurning(store.getState()))
})

it('properly increments the turn when I play an ace', async (t) => {
  const data: GameState = {
    turnClocks: [],
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
    pickupPile: [{ suit: 'H', id: '6H', value: '6' }],
    focused: '',
    burnt: [],
    queue: ['a'],
    direction: -1,
  }

  const store = getStore(data)
  store.dispatch(unlockTurn({ channel: 'user:target', data: 'b' }))
  await store.dispatch(
    playCardThunk({ cards: [createCard('A', 'H')], playerID: 'a' }),
  )
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

  store.dispatch(unlockTurn({ channel: 'user:target', data: 'b' }))
  await store.dispatch(
    playCardThunk({ cards: [createCard('A', 'H')], playerID: 'a' }),
  )

  t.is(isReplenishing(store.getState()), true)
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

  await store.dispatch(
    playCardThunk({ cards: [createCard('6', 'H')], playerID: 'a' }),
  )
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

  await store.dispatch(
    playCardThunk({ cards: [createCard('3', 'H')], playerID: 'a' }),
  )
  t.is(store.getState().stack.length, 1)
})

it('treats 8s as invisible', async (t) => {
  const { getState, dispatch } = getStore({
    queue: ['a'],
    stack: [createCard('8', 'D'), createCard('3', 'S')],
  })

  await dispatch(
    playCardThunk({ cards: [createCard('8', 'H')], playerID: 'a' }),
  )

  t.is(stackDestinationSelector(getState()).id, '3S')

  //   addToStack(state, card)
  //   t.is(state.stack.length, 3)
})

it('clears the afterimage when I play a non-queen', async (t) => {
  const { getState, dispatch } = getStore({
    queue: ['a'],
    stack: [createCard('8', 'D'), createCard('3', 'S')],
    afterimage: [createCardByID('QD')],
  })

  t.is(stackDestinationSelector(getState()).id, 'QD')

  await dispatch(
    playCardThunk({ cards: [createCard('2', 'H')], playerID: 'a' }),
  )

  t.is(getState().afterimage.length, 0)
  t.is(stackDestinationSelector(getState()).id, '2H')
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

  await store.dispatch(
    playCardThunk({ cards: [createCard('7', 'D')], playerID: 'a' }),
  )
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
    playCardThunk({
      cards: [createCard('7', 'D'), createCard('7', 'H')],
      playerID: 'a',
    }),
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
    queue: ['a'],
  })

  await store.dispatch(
    playCardThunk({
      cards: [createCard('7', 'D'), createCard('7', 'H'), createCard('7', 'C')],
      playerID: 'a',
    }),
  )
  t.is(store.getState().direction, -1)
})

it('cannot play a QC on a JD', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
  })

  await store.dispatch(
    playCardThunk({ cards: [createCard('Q', 'C')], playerID: 'a' }),
  )
  t.is(store.getState().stack.length, 1)
})

it('can play a 3D on a JD', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    queue: ['a'],
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

  await store.dispatch(
    playCardThunk({ cards: [createCard('3', 'D')], playerID: 'a' }),
  )
  t.is(store.getState().stack.length, 2)
  t.log(store.getState())
})

it('can play a 2D on a JD', async (t) => {
  const store = getStore({
    stack: [createCard('J', 'D')],
    queue: ['a'],
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

  await store.dispatch(
    playCardThunk({ cards: [createCard('2', 'D')], playerID: 'a' }),
  )
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
      playerID: 'a',
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

  await store.dispatch(
    playCardThunk({ cards: [createCard('9', 'D')], playerID: 'a' }),
  )

  t.is(store.getState().stack.length, 2)
  t.is(isReplenishing(store.getState()), true)
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

  await dispatch(
    playCardThunk({ cards: [createCard('3', 'D')], playerID: 'a' }),
  )
  t.log(getState())
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

  store.dispatch(
    playCardThunk({ cards: [createCard('3', 'D')], playerID: 'a' }),
  )
  t.false(isReplenishing(store.getState()))
})
