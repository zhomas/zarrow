import {
  Action,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkAction,
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
import { createCard } from './deck'
import { GameDispatch } from '.'

export interface GameState {
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
  turnPhase?: 'idle' | 'playing' | 'user:target' | 'user:replenish'
  focused?: string
  idleBurn?: boolean
  local?: {
    targeting: boolean
    targetingCards: CardModel[]
    targetUID: string
  }
}

export const initialState: GameState = {
  direction: 1,
  queue: [],
  players: [],
  stack: [],
  burnt: [],
  pickupPile: [],
  idleBurn: false,
  local: {
    targeting: false,
    targetingCards: [],
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
}

export const playCardThunk = createAppThunk(
  'counter/play:cards',
  async ({ cards }: PlayCardArgs, { dispatch, getState }) => {
    if (cards.length === 0) throw new Error('Cannot play zero cards')
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
      dispatch(startBurn())
      await new Promise((resolve) => setTimeout(resolve, 1500))
      dispatch(completeBurn())
    }

    // Acquire target
    if (ace) {
      dispatch(setTurnPhase('user:target'))
      dispatch(startTargeting(cards))

      while (!getState().local.targetUID) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      aceTarget = getState().local.targetUID
    }

    // Process reverse
    if (cards.filter((c) => c.value === '7').length % 2 === 1) {
      dispatch(reverse())
    }

    // Get next player
    console.log('GETNEXTPL')
    const next = aceTarget || getNextPlayer(getState())
    console.log('NEXT PLAYER', next)

    const tier = activeTierSelector(getState())
    const [] = tier

    // Replenish stack
    const needsConfirmation =
      getState().pickupPile.length > 0 && tier.length < 4

    if (needsConfirmation) {
      dispatch(setTurnPhase('user:replenish'))

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (getState().turnPhase !== 'user:replenish') {
          break
        }
      }
    }

    dispatch(completeTurn(next))

    if (cards.some((c) => c.id === 'QH')) {
      console.log('final value :: ', getState())
    }
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

      cards.forEach(() => {})

      for (const card of cards) {
        if (card.value === '6') {
          console.log('adding card', card)
        }
        if (player) {
          player.cards = player.cards.filter((c) => c.card.id !== card.id)
        }
        state.stack.unshift(card)
      }

      if (cards.some((c) => c.value === '6')) {
        console.log('adding card COMPLETE')
      }
    },
    pickupStack(state, action: PayloadAction<CardModel[]>) {
      pickup(state, ...action.payload)
    },
    focus(state, action: PayloadAction<string>) {
      state.focused = action.payload
    },
    startBurn(state) {
      state.idleBurn = true
    },
    setTurnPhase(state, action: PayloadAction<GameState['turnPhase']>) {
      state.turnPhase = action.payload
    },
    reverse(state) {
      state.direction *= -1
    },
    completeBurn(state) {
      state.burnt = [...state.stack, ...state.burnt]
      state.stack = []
      state.idleBurn = false
    },
    startTargeting(state, action: PayloadAction<CardModel[]>) {
      state.local.targeting = true
      state.local.targetingCards = action.payload
      state.local.targetUID = ''
    },
    confirmReplenish(state) {
      state.turnPhase = 'playing'
    },
    confirmTargeting(state, action: PayloadAction<string>) {
      const target = action.payload
      state.local.targetUID = target
    },
    completeTurn(state, action: PayloadAction<string>) {
      const next = action.payload
      console.log('COMPLETING TURN...')
      const player = activePlayerSelector(state)
      const { pickupPile } = state

      while (
        pickupPile.length > 0 &&
        player.cards.filter((c) => c.tier === 2).length < 4
      ) {
        player.cards.push({ card: pickupPile.shift(), tier: 2 })
      }

      state.queue = [...new Set([next, ...state.queue])].filter((id) => !!id)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(playCardThunk.pending, (state) => {
      state.turnPhase = 'playing'
      state.focused = ''
    })
    builder.addCase(playCardThunk.fulfilled, (state) => {
      state.local.targeting = false
      state.local.targetUID = ''
      state.local.targetingCards = []
      state.turnPhase = 'idle'
    })
  },
})

const {
  startBurn,
  completeBurn,
  addToStack,
  setTurnPhase,
  completeTurn,
} = counterSlice.actions

export const {
  deal,
  pickupStack,
  joinGame,
  setFaction,
  replace,
  focus,
  reverse,
  startTargeting,
  confirmReplenish,
  confirmTargeting,
} = counterSlice.actions

export default counterSlice.reducer
