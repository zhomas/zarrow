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
import { playCard as play, shouldBurn } from './rules/play'
import { playAce as ace } from './rules/ace'
import { endTurn as end } from './rules/endTurn'

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
  turnIsFresh?: boolean
  focused?: string
  idleBurn?: boolean
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

export const playCardThunk = createAppThunk(
  'counter/play:cards',
  async (x: { cards: CardModel[] }, thunkAPI) => {
    const action = playCard({ cards: x.cards })
    thunkAPI.dispatch(action)

    if (shouldBurn(thunkAPI.getState())) {
      thunkAPI.dispatch(startBurn())
      await new Promise((resolve) => setTimeout(resolve, 3000))
      thunkAPI.dispatch(completeBurn())
    }
  },
)

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    replace(state, action: PayloadAction<GameState>) {
      console.log('REPLACE')
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
    playCard(state, action: PayloadAction<PlayCard>) {
      const { cards } = action.payload
      play(state, ...cards)
    },
    pickupStack(state, action: PayloadAction<CardModel[]>) {
      pickup(state, ...action.payload)
    },
    playAce(state, action: PayloadAction<PlayAce>) {
      ace(state, action.payload)
    },
    endTurn(state) {
      end(state)
    },
    focus(state, action: PayloadAction<string>) {
      state.focused = action.payload
    },
    startBurn(state) {
      state.idleBurn = true
    },
    completeBurn(state) {
      state.burnt = [...state.stack, ...state.burnt]
      state.stack = []
      state.idleBurn = false
    },
  },
})

const { startBurn, completeBurn, playCard, playAce } = counterSlice.actions

export const {
  deal,
  pickupStack,
  joinGame,
  setFaction,
  endTurn,
  replace,
  focus,
} = counterSlice.actions

export default counterSlice.reducer
