import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { canCardPlay } from './matrix'
import { PlayAce } from './rules/ace'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import { playCard as play } from './rules/play'
import { playAce as ace } from './rules/ace'
import { endTurn as end } from './rules/endTurn'

import { CardModel, PlayerModel } from './types'
import { joinGame as join, changeFaction as faction } from './rules/create'

export interface GameState {
  next: string
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
}

export const initialState: GameState = {
  next: '',
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

interface Join {
  uid: string
  displayName: string
}

interface Faction {
  uid: string
  faction: number
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    replace(state, action: PayloadAction<GameState>) {
      console.log('REPLACE')
      state.players = action.payload.players
      state.stack = action.payload.stack
      state.queue = action.payload.queue
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
      console.log('PLAY CARD!', cards)
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
  },
})

export const {
  deal,
  playCard,
  pickupStack,
  playAce,
  joinGame,
  setFaction,
  endTurn,
  replace,
} = counterSlice.actions
export default counterSlice.reducer
