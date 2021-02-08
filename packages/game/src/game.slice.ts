import { createSlice, Dictionary, PayloadAction } from '@reduxjs/toolkit'
import { canCardPlay } from './matrix'
import { PlayAce } from './rules/ace'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import { playCard as play } from './rules/play'
import { playAce as ace } from './rules/ace'
import { endTurn as end } from './rules/endTurn'

import { CardModel, PlayerModel } from './types'
import { joinGame as join, changeFaction as faction } from './rules/create'
import { createCard } from './deck'

export interface GameState {
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
  turnIsFresh?: boolean
  focused?: string
}

export const initialState: GameState = {
  direction: 1,
  queue: [],
  players: [],
  stack: [],
  burnt: [],
  pickupPile: [],
  turnIsFresh: true,
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
  focus,
} = counterSlice.actions
export default counterSlice.reducer
