import {
  Action,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
  createSlice,
  Dictionary,
  PayloadAction,
  ThunkAction,
} from '@reduxjs/toolkit'
import { canCardPlay } from './matrix'
import { PlayAce } from './rules/ace'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import { addToStack as play, shouldBurn } from './rules/play'
import { playAce as ace } from './rules/ace'
import { getNextPlayer } from './rules/endTurn'

import { CardModel, PlayerModel } from './types'
import { joinGame as join, changeFaction as faction } from './rules/create'
import { createCard } from './deck'
import { GameDispatch, getStore } from '.'

export interface GameState {
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
  turnPhase?: 'idle' | 'playing' | 'user:target' | 'user:replenish'
  turnIsFresh?: boolean
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
  turnIsFresh: true,
  idleBurn: false,
  local: {
    targeting: false,
    targetingCards: [],
    targetUID: '',
  },
}

export const activePlayerSelector = (state: GameState) => {
  const id = state.queue[0]
  return state.players.find((p) => p.id === id)
}

export const stackDestinationSelector = (state: GameState) => {
  for (const card of state.stack) {
    if (card.value === '8') continue
    return card
  }

  return createCard('3', 'H') // Anything can play on a 3
}

export const activeTierSelector = (state: GameState) => {
  const player = activePlayerSelector(state)
  const max = Math.max(...player.cards.map((c) => c.tier))
  return player.cards.filter((c) => c.tier === max)
}

export const mustPickUpSelector = (state: GameState) => {
  const dest = stackDestinationSelector(state)
  const options = activeTierSelector(state)
  return !options.some((c) => canCardPlay(c.card, dest))
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

type AppThunk = ThunkAction<void, GameState, unknown, Action<string>>

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
  async ({ cards }: PlayCardArgs, { dispatch, getState, rejectWithValue }) => {
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
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      aceTarget = getState().local.targetUID
    }

    // Process reverse
    if (cards.filter((c) => c.value === '7').length % 2 === 1) {
      dispatch(reverse())
    }

    // Get next player
    const next = aceTarget || getNextPlayer(getState())

    const tier = activeTierSelector(getState())
    const [c] = tier

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
      state.turnIsFresh = action.payload.turnIsFresh
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

      cards.forEach((card) => {})

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
    playAce(state, action: PayloadAction<PlayAce>) {
      ace(state, action.payload)
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
      state.turnIsFresh = false
      state.turnPhase = 'playing'
      state.focused = ''
    })
    builder.addCase(playCardThunk.fulfilled, (state) => {
      state.local.targeting = false
      state.local.targetUID = ''
      state.local.targetingCards = []
      state.turnPhase = 'idle'
      state.turnIsFresh = true
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
