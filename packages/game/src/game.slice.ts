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

type TurnLock = 'burn' | 'user:replenish' | 'user:target' | 'user:faceuptake'

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

export const playCardThunk = createAppThunk(
  'counter/play:cards',
  async ({ cards, playerID }: PlayCardArgs, { dispatch, getState }) => {
    if (cards.length === 0) throw new Error('Cannot play zero cards')
    if (getState().queue[0] !== playerID)
      throw new Error('Cannot play card as not player')
    const state = getState()
    const destination = stackDestinationSelector(state)
    cards = cards.filter((c) => canCardPlay(c, destination))

    const ok = cards.length > 0
    const ace = cards.some((c) => c.value === 'A')

    if (!ok) throw new Error('card cannot play')

    // Add to stack
    dispatch(addToStack({ cards }))

    let aceTarget: string = undefined

    // Consider burn

    if (shouldBurn(getState())) {
      dispatch(lockTurn('burn'))
      await new Promise((resolve) => setTimeout(resolve, 1500))
      dispatch(unlockTurn({ channel: 'burn' }))
    }

    // Acquire target
    if (ace) {
      dispatch(lockTurn('user:target'))
      while (getState().turnLocks.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      aceTarget = getState().local.targetUID
    }

    // Process reverse
    if (cards.filter((c) => c.value === '7').length % 2 === 1) {
      dispatch(reverse())
    }

    // Get next player
    const next = aceTarget || getNextPlayer(getState())
    console.log('NEXT PLAYER', next)

    const tier = activeTierSelector(getState())
    const [] = tier

    // Replenish stack
    const needsConfirmation =
      getState().pickupPile.length > 0 && tier.length < 4

    if (needsConfirmation) {
      dispatch(lockTurn('user:replenish'))
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (getState().turnLocks.length === 0) {
          break
        }
      }
    } else {
      dispatch(unlockTurn({ channel: 'user:replenish' }))
    }

    return next
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

const { addToStack, lockTurn, pickupStack } = counterSlice.actions

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
