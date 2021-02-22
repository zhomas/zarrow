import {
  AsyncThunkPayloadCreator,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { canCardPlay } from './matrix'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import {
  stackDestinationSelector,
  activePlayerSelector,
  activeTierSelector,
  shouldBurn,
  getNextPlayer,
} from './selectors'
import { CardModel, PlayerModel } from './types'
import { joinGame as join, changeFaction as faction } from './rules/create'
import { GameDispatch, hasLock } from '.'
import { createCardByID } from './deck'

type TurnLock =
  | 'animate'
  | 'burn'
  | 'user:replenish'
  | 'user:target'
  | 'user:faceuptake'

type TurnClock = 'ww7' | 'skip' | 'glideonby' | 'dw7' | 'burn' | 'reset'

export interface GameState {
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
  focused?: string
  local?: {
    faceUpPickID: string
    targetUID: string
  }
  turnLocks?: TurnLock[]
  turnClocks: TurnClock[]
}

export const initialState: GameState = {
  direction: 1,
  queue: [],
  players: [],
  stack: [],
  burnt: [],
  pickupPile: [],
  turnLocks: [],
  local: {
    faceUpPickID: '',
    targetUID: '',
  },
  turnClocks: [],
}

interface GameInitialiser {
  deck: CardModel[]
}

interface PlayCard {
  cards: CardModel[]
}

interface Join {
  uid: string
  displayName: string
}

interface Faction {
  uid: string
  faction: number
}

type ThunkApiConfig = {
  dispatch: GameDispatch
  state: GameState
}

export function createAppThunk<Returned = void, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
) {
  return createAsyncThunk<Returned, ThunkArg, ThunkApiConfig>(
    typePrefix,
    payloadCreator,
  )
}

interface PlayCardArgs {
  cards: CardModel[]
  playerID: string
}

const applyClock = createAppThunk(
  'game/clock',
  async (clock: TurnClock, { dispatch }) => {
    dispatch(addClock(clock))
    await new Promise((resolve) => setTimeout(resolve, 1500))
    dispatch(resolveClock(clock))
  },
)

const getCardEffect = (cards: CardModel[]) => {
  const [card] = cards
  if (card.value === 'A') return 'ace'
  if (card.value === '5') return 'skip'
  if (card.value === '8') return 'glide'
  if (card.value === '2') return 'neutralise'
  if (card.value === 'Q') return 'psychic'
  if (card.value === 'K') return 'steal'
  if (cards.some((c) => c.value === '7')) {
    const count = cards.filter((c) => c.value === '7').length
    if (count % 2 === 1) return 'ww7'
    return 'dw7'
  }
}

export const pickupThunk = createAppThunk(
  'counter/pickup:stack',
  async (_, { dispatch, getState }) => {
    const activeCards = activeTierSelector(getState())

    let additions: CardModel[] = []

    if (activeCards.some((c) => c.tier === 1)) {
      // Face up pickup rule
      dispatch(lockTurn('user:faceuptake'))
      const locked = hasLock('user:faceuptake')

      while (locked(getState())) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const card = createCardByID(getState().local.faceUpPickID)

      console.log({ card })

      additions = [
        ...additions,
        ...activeCards
          .filter((c) => c.card.value === card.value)
          .map((c) => c.card),
      ]
    }

    dispatch(pickupStack(additions))
  },
)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const sleepUntil = async (fn: () => boolean) => {
  while (!fn()) {
    await sleep(100)
  }
}

export const playCardThunk = createAppThunk(
  'counter/play:cards',
  async ({ cards, playerID }: PlayCardArgs, { dispatch, getState }) => {
    if (getState().queue[0] !== playerID) {
      throw new Error('Cannot play card as not player')
    }

    const destination = stackDestinationSelector(getState())
    cards = cards.filter((c) => canCardPlay(c, destination))

    const effect = getCardEffect(cards)

    let aceTarget: string = undefined

    if (cards.length === 0) {
      throw new Error('card cannot play')
    }

    // Add to stack
    dispatch(addToStack({ cards }))
    dispatch(lockTurn('animate'))
    await sleep(400)
    dispatch(unlockTurn({ channel: 'animate' }))

    if (shouldBurn(getState())) {
      dispatch(applyClock('burn'))
      dispatch(lockTurn('burn'))
      await sleep(1500)
      dispatch(unlockTurn({ channel: 'burn' }))
    } else {
      switch (effect) {
        case 'ace':
          dispatch(lockTurn('user:target'))
          await sleepUntil(() => getState().turnLocks.length === 0)
          aceTarget = getState().local.targetUID
          break
        case 'glide':
          dispatch(applyClock('glideonby'))
          break
        case 'neutralise':
          dispatch(applyClock('reset'))
          break
        case 'skip':
          dispatch(applyClock('skip'))
          break
        case 'ww7':
          dispatch(reverse())
          dispatch(applyClock('ww7'))
          break
        case 'dw7':
          dispatch(applyClock('dw7'))
          break
        default:
          break
      }
    }

    // Replenish stack
    const tier = activeTierSelector(getState())
    const pickupRequired = getState().pickupPile.length > 0 && tier.length < 4

    if (pickupRequired) {
      dispatch(lockTurn('user:replenish'))
      await sleepUntil(() => getState().turnLocks.length === 0)

      dispatch(unlockTurn({ channel: 'user:replenish' }))
    }

    return aceTarget || getNextPlayer(getState())
  },
)

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    replace(state, action: PayloadAction<GameState>) {
      state.players = action.payload.players
      state.stack = action.payload.stack
      state.queue = action.payload.queue
      state.pickupPile = action.payload.pickupPile
      state.burnt = action.payload.burnt
      state.direction = action.payload.direction
      state.focused = action.payload.focused
      state.turnLocks = action.payload.turnLocks
      state.turnClocks = action.payload.turnClocks
    },
    joinGame(state, action: PayloadAction<Join>) {
      join(state, action.payload.uid, action.payload.displayName)
    },
    setFaction(state, action: PayloadAction<Faction>) {
      faction(state, action.payload.uid, action.payload.faction)
    },
    deal(state, action: PayloadAction<GameInitialiser>) {
      dealCards(state, action.payload.deck)
    },
    addToStack(state, action: PayloadAction<PlayCard>) {
      const { cards } = action.payload
      const player = activePlayerSelector(state)

      for (const card of cards) {
        if (player) {
          player.cards = player.cards.filter((c) => c.card.id !== card.id)
        }
        state.stack.unshift(card)
      }
    },
    pickupStack(state, action: PayloadAction<CardModel[]>) {
      pickup(state, ...action.payload)
    },
    focus(state, action: PayloadAction<string>) {
      state.focused = action.payload
    },
    reverse(state) {
      state.direction *= -1
    },
    lockTurn(state, action: PayloadAction<GameState['turnLocks'][number]>) {
      state.turnLocks = [...state.turnLocks, action.payload]
    },
    unlockTurn(
      state,
      action: PayloadAction<{ channel: TurnLock; data?: string }>,
    ) {
      state.turnLocks = state.turnLocks.filter(
        (t) => t !== action.payload.channel,
      )

      switch (action.payload.channel) {
        case 'user:target':
          state.local.targetUID = action.payload.data
          break
        case 'burn':
          state.burnt = [...state.stack, ...state.burnt]
          state.stack = []
          break
        case 'user:faceuptake':
          state.local.faceUpPickID = action.payload.data
          break
      }
    },
    addClock(state, action: PayloadAction<TurnClock>) {
      state.turnClocks.push(action.payload)
    },
    resolveClock(state, action: PayloadAction<TurnClock>) {
      state.turnClocks = state.turnClocks.filter((c) => c !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(playCardThunk.pending, (state) => {
      state.focused = ''
    })
    builder.addCase(playCardThunk.fulfilled, (state, action) => {
      const next = action.payload

      state.local.targetUID = ''
      state.local.faceUpPickID = ''

      state.turnLocks = []

      const player = activePlayerSelector(state)
      const { pickupPile } = state

      while (
        pickupPile.length > 0 &&
        player.cards.filter((c) => c.tier === 2).length < 4
      ) {
        player.cards.push({ card: pickupPile.shift(), tier: 2 })
      }
      console.log({ next })
      state.queue = [...new Set([next, ...state.queue])].filter((id) => !!id)
    })
  },
})

const {
  addToStack,
  lockTurn,
  pickupStack,
  addClock,
  resolveClock,
} = counterSlice.actions

export const {
  deal,
  unlockTurn,
  joinGame,
  setFaction,
  replace,
  focus,
  reverse,
} = counterSlice.actions

export default counterSlice.reducer
