import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { canCardPlay } from './matrix'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import { playCard as play } from './rules/play'
import { CardModel, PlayerModel } from './types'
import { getWrappedIndex } from './utils'

export interface GameState {
  turnIndex: number
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
}

export const initialState: GameState = {
  turnIndex: 0,
  players: [],
  stack: [],
  burnt: [],
  pickupPile: [],
}

export const activePlayerSelector = (state: GameState) => {
  const inPlay = state.players.filter((p) => p.cards.length > 0)

  const idx = getWrappedIndex(state.turnIndex, inPlay.length)
  return inPlay[idx]
}

export const topOfStackSelector = (state: GameState) => {
  return state.stack[0]
}

export const activeTierSelector = (state: GameState) => {
  const player = activePlayerSelector(state)
  const max = Math.max(...player.cards.map((c) => c.tier))
  return player.cards.filter((c) => c.tier === max)
}

export const mustPickUpSelector = (state: GameState) => {
  const dest = topOfStackSelector(state)
  const options = activeTierSelector(state)
  return !options.some((c) => canCardPlay(c.card, dest))
}

interface GameInitialiser {
  factions: string[][]
  deck: CardModel[]
}

interface PlayCard {
  playerIndex: number
  cards: CardModel[]
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    deal(state, action: PayloadAction<GameInitialiser>) {
      dealCards(state, action.payload)
    },
    playCard(state, action: PayloadAction<PlayCard>) {
      const { cards } = action.payload
      play(state, ...cards)
    },
    pickupStack(state, action: PayloadAction<CardModel[]>) {
      pickup(state, ...action.payload)
    },
  },
})

export const { deal, playCard, pickupStack } = counterSlice.actions
export default counterSlice.reducer
