import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { canCardPlay } from './matrix'
import { PlayAce } from './rules/ace'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import { playCard as play } from './rules/play'
import { playAce as ace } from './rules/ace'

import { CardModel, PlayerModel } from './types'

export interface GameState {
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
}

export const initialState: GameState = {
  direction: 1,
  queue: [],
  players: [],
  stack: [],
  burnt: [],
  pickupPile: [],
}

export const activePlayerSelector = (state: GameState) => {
  const id = state.queue[0]
  return state.players.find((p) => p.id === id)
}

export const topOfStackSelector = (state: GameState) => {
  for (const card of state.stack) {
    if (card.value === '8') continue
    return card
  }

  return undefined
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
    create(state, action: PayloadAction<string>) {},
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
  },
})

export const { deal, playCard, pickupStack, playAce } = counterSlice.actions
export default counterSlice.reducer