import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'

import { CardModel, PlayerModel, TurnClock, TurnLock } from './types'
import { joinGame as join, changeFaction as faction } from './rules/create'

import { createCardByID } from './deck'
import { sortHand as sort } from './rules/sort'
import { playCardThunk } from './thunks/play'

import {
  activePlayerSelector,
  getCardEffect,
  highestTierSelector,
  playerHasCardInTierSelector,
  StackEffect,
} from './selectors'

export interface GameState {
  direction: number
  queue: string[]
  players: PlayerModel[]
  stack: CardModel[]
  burnt: CardModel[]
  pickupPile: CardModel[]
  afterimage: CardModel[]
  focused?: string
  local?: {
    faceUpPickID: string
    targetUID: string
  }
  turnLocks?: TurnLock[]
  turnClocks: TurnClock[]
  stackEffect?: StackEffect | ''
  activeSteal: {
    participants: string[]
    userSteals: number
    reciprocatedSteals: number
  }
}

export const initialState: GameState = {
  direction: 1,
  queue: [],
  players: [],
  stack: [],
  burnt: [],
  pickupPile: [],
  turnLocks: [],
  afterimage: [],
  local: {
    faceUpPickID: '',
    targetUID: '',
  },
  turnClocks: [],
  stackEffect: undefined,
  activeSteal: {
    participants: [],
    userSteals: 0,
    reciprocatedSteals: 0,
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

interface StealPayload {
  count: number
  targetID: string
}

interface StealSinglePayload {
  userID: string
  cardID: string
}

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
      state.afterimage = action.payload.afterimage
      state.stackEffect = action.payload.stackEffect
      state.activeSteal = action.payload.activeSteal
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

      state.turnLocks = [...state.turnLocks, 'animate']
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
    sortHand(state, action: PayloadAction<string>) {
      sort(state, action.payload)
    },
    applyCardEffect(state, action: PayloadAction<CardModel[]>) {
      const cards = action.payload
      const [card] = cards
      const player = activePlayerSelector(state)

      const effect = getCardEffect(cards, state)

      switch (effect) {
        case 'glide':
          state.turnClocks.push('glideonby')
          break
        case 'neutralise':
          state.turnClocks.push('reset')
          break
        case 'skip':
          state.turnClocks.push('skip')
          break
        case 'dw7':
          state.turnClocks.push('dw7')

          break
        case 'ace':
          state.turnLocks.push('user:target')
          break
        case 'ww7':
          state.turnClocks.push('ww7')
          state.direction *= -1
          break
        case 'psychic':
          state.turnClocks.push('queen')
          const faceDowns = player.cards.filter((c) => c.tier === 0)
          const count = Math.min(cards.length, faceDowns.length)
          for (let i = 0; i < count; i++) {
            const card = cards[i]
            const stackIndex = state.stack.findIndex((c) => c.id === card.id)

            state.turnLocks.push('user:psychicreveal')
            state.stack.splice(stackIndex, 1)
            state.burnt.push(card)
            state.afterimage.push(card)
          }

          break
        case 'steal':
          state.turnLocks.push('steal:target')
          state.burnt.push(card)
          state.afterimage.push(card)
          break
        default:
          break
      }

      if (card.value !== 'Q') {
        state.afterimage = []
      }
      state.stackEffect = effect
      state.turnLocks = state.turnLocks.filter((l) => l !== 'animate')
    },
    selectStealTarget(state, action: PayloadAction<StealPayload>) {
      state.activeSteal = {
        participants: [activePlayerSelector(state).id, action.payload.targetID],
        userSteals: action.payload.count,
        reciprocatedSteals: action.payload.count,
      }

      state.turnLocks = state.turnLocks.filter((l) => l !== 'steal:target')
      state.turnLocks.push('steal:selectcards')
    },
    stealSingleCard(state, action: PayloadAction<StealSinglePayload>) {
      const { activeSteal, queue } = state
      const { userID, cardID } = action.payload
      const activeID = activePlayerSelector(state).id
      const reciprocal = userID !== activeID

      for (const id of state.activeSteal.participants) {
        const player = state.players.find((p) => p.id === id)

        if (id === userID) {
          player.cards.push({
            card: createCardByID(cardID),
            tier: highestTierSelector(id)(state),
            stolen: true,
          })
        } else {
          player.cards = player.cards.filter((c) => c.card.id !== cardID)
        }
      }

      if (reciprocal) {
        state.activeSteal.reciprocatedSteals--
      } else {
        state.activeSteal.userSteals--
      }

      if (state.activeSteal.userSteals > state.activeSteal.reciprocatedSteals) {
        state.turnLocks = ['steal:selectcards']
      } else if (
        state.activeSteal.reciprocatedSteals > state.activeSteal.userSteals
      ) {
        state.turnLocks = ['steal:reciprocate']
      } else {
        state.turnLocks = []
      }
    },
    lockTurn(
      state,
      action: PayloadAction<{ channel: TurnLock; count?: number }>,
    ) {
      const count = action.payload.count || 1
      const arr = new Array(count).fill(action.payload.channel)

      state.turnLocks = [...state.turnLocks, ...arr]
    },
    startBurn(state) {
      state.turnClocks.push('burn')
      state.turnLocks.push('burn')
    },
    completeBurn(state) {
      state.burnt = [...state.stack, ...state.burnt]
      state.stack = []
      state.turnLocks = state.turnLocks.filter((l) => l !== 'burn')
    },
    unlockTurn(
      state,
      action: PayloadAction<{ channel: TurnLock; data?: string }>,
    ) {
      switch (action.payload.channel) {
        case 'user:target':
          state.local.targetUID = action.payload.data
          break
        case 'user:faceuptake':
          state.local.faceUpPickID = action.payload.data
          break
        case 'user:psychicreveal':
          const revealed = action.payload.data
          const player = activePlayerSelector(state)
          const ok = playerHasCardInTierSelector(player.id, revealed, 0)(state)
          if (!ok) return

          const others = player.cards.filter((c) => c.card.id !== revealed)
          player.cards = [
            ...others,
            { card: createCardByID(revealed), tier: 1 },
          ]

          break
      }

      const idx = state.turnLocks.findIndex((t) => t === action.payload.channel)
      state.turnLocks.splice(idx, 1)
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

      const player = activePlayerSelector(state)
      const { pickupPile } = state
      while (
        pickupPile.length > 0 &&
        player.cards.filter((c) => c.tier === 2).length < 4
      ) {
        player.cards.push({ card: pickupPile.shift(), tier: 2 })
      }

      state.queue = [...new Set([next, ...state.queue])].filter((id) => !!id)
      state.turnLocks = []
      state.turnClocks = []
      state.local.targetUID = ''
      state.local.faceUpPickID = ''
      state.activeSteal = {
        userSteals: 0,
        reciprocatedSteals: 0,
        participants: [],
      }
      state.players = state.players.map((pl) => {
        return {
          ...pl,
          cards: pl.cards.map((c) => {
            return {
              ...c,
              stolen: false,
            }
          }),
        }
      })
    })
  },
})

export const {
  deal,
  unlockTurn,
  joinGame,
  setFaction,
  replace,
  focus,
  reverse,
  sortHand,
  addToStack,
  lockTurn,
  applyCardEffect,
  stealSingleCard,
  addClock,
  resolveClock,
  pickupStack,
  startBurn,
  completeBurn,
  selectStealTarget,
} = counterSlice.actions

export default counterSlice.reducer
