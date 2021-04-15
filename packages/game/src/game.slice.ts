import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { dealCards } from './rules/deal'
import { pickup } from './rules/pickup'
import {
  stealSingleCard as stealSingle,
  selectStealTarget as stealSelect,
} from './rules/steal'

import { CardModel, PlayerModel, TurnLock } from './types'
import { joinGame as join, changeFaction as faction } from './rules/create'

import { createCardByID, Deck } from './deck'
import { sortHand as sort } from './rules/sort'
import { playCardThunk } from './thunks/play'

import {
  activePlayerSelector,
  getCardEffect,
  highestTierSelector,
  playerHasCardInTierSelector,
  StackEffect,
} from './selectors'
import { confirmChain } from './thunks/common'
import { revealThunk } from './thunks'
import { pregamePick } from './thunks/pregame'

export interface GameState {
  dealID?: string
  direction: number
  burning?: boolean
  animating?: boolean
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
  stackEffect?: StackEffect | ''
  activeSteal: {
    targeting?: boolean
    participants: string[]
    userSteals: number
    reciprocatedSteals: number
  }
  pendingChains?: string[]
  chainIt?: {
    show: boolean
    value: boolean
  }
  pregame?: {
    [id: string]: boolean
  }
}

const removeLock = (lock: TurnLock, state: GameState) => {
  const idx = state.turnLocks.findIndex((t) => t === lock)
  state.turnLocks.splice(idx, 1)
}

export const initialState: GameState = {
  direction: 1,
  burning: false,
  animating: false,
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
  stackEffect: undefined,
  activeSteal: {
    targeting: false,
    participants: [],
    userSteals: 0,
    reciprocatedSteals: 0,
  },
  pendingChains: [],
  pregame: {},
}

interface GameInitialiser {
  deck: Deck
  skipPregame?: boolean
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
      state.players = action.payload.players
      state.stack = action.payload.stack
      state.queue = action.payload.queue
      state.pickupPile = action.payload.pickupPile
      state.burnt = action.payload.burnt
      state.direction = action.payload.direction
      state.focused = action.payload.focused
      state.turnLocks = action.payload.turnLocks
      state.afterimage = action.payload.afterimage
      state.stackEffect = action.payload.stackEffect
      state.activeSteal = action.payload.activeSteal
      state.burning = !!action.payload.burning
      state.animating = !!action.payload.animating
      state.chainIt = action.payload.chainIt
      state.pendingChains = action.payload.pendingChains || []
      state.pregame = action.payload.pregame
      state.dealID = action.payload.dealID
    },
    joinGame(state, action: PayloadAction<Join>) {
      join(state, action.payload.uid, action.payload.displayName)
    },
    setFaction(state, action: PayloadAction<Faction>) {
      faction(state, action.payload.uid, action.payload.faction)
    },
    deal(state, action: PayloadAction<Deck>) {
      dealCards(state, action.payload, false)
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

      state.animating = true
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
        case 'ace':
          state.turnLocks.push('user:target')
          break
        case 'ww7':
          state.direction *= -1
          break
        case 'psychic':
          const faceDowns = player.cards.filter((c) => c.tier === 0)
          const count = Math.min(cards.length, faceDowns.length)
          for (let i = 0; i < count; i++) {
            state.turnLocks.push('user:psychicreveal')
          }

          break
        case 'steal':
          state.activeSteal = {
            targeting: true,
            participants: [],
            reciprocatedSteals: 0,
            userSteals: 0,
          }
          break
        default:
          break
      }

      if (!['Q', 'K'].includes(card.value)) {
        state.afterimage = []
      }
      state.stackEffect = effect
      state.animating = false
    },
    selectStealTarget: stealSelect,
    selectAceTarget(state, action: PayloadAction<string>) {
      removeLock('user:target', state)
      state.local.targetUID = action.payload
    },
    stealSingleCard: stealSingle,
    startFupu(state) {
      state.turnLocks.push('user:faceuptake')
    },
    startBurn(state) {
      state.burning = true
      state.animating = false
    },
    completeBurn(state) {
      state.burnt = [...state.stack, ...state.burnt]
      state.stack = []
      state.afterimage = []
      state.burning = false
    },
    startMiniburn(state) {
      state.animating = false
      state.burning = true
    },
    completeMiniburn(state) {
      const remove = state.stack.filter((c) => ['Q', 'K'].includes(c.value))
      state.burning = false
      for (const card of remove) {
        state.burnt.push(card)
        state.afterimage.push(card)
        state.stack.splice(
          state.stack.findIndex((c) => c.id === card.id),
          1,
        )
      }
    },
    completeReveal(state, action: PayloadAction<string>) {
      const revealed = action.payload
      const player = activePlayerSelector(state)
      const ok = playerHasCardInTierSelector(player.id, revealed, 0)(state)
      const card = createCardByID(revealed)
      if (ok) {
        const others = player.cards.filter((c) => c.card.id !== revealed)
        player.cards = [...others, { card, tier: 1 }]
        removeLock('user:psychicreveal', state)
      }
    },
    startReplenish(state) {
      state.turnLocks.push('user:replenish')
    },
    confirmReplenish(state) {
      removeLock('user:replenish', state)
      const player = activePlayerSelector(state)
      const { pickupPile } = state
      while (
        pickupPile.length > 0 &&
        player.cards.filter((c) => c.tier === 2).length < 4
      ) {
        player.cards.push({ card: pickupPile.shift(), tier: 2 })
      }
    },
    confirmAceTarget(state, action: PayloadAction<string>) {
      removeLock('user:target', state)
      state.local.targetUID = action.payload
    },
    confirmFupu(state, action: PayloadAction<CardModel>) {
      removeLock('user:faceuptake', state)
      state.local.faceUpPickID = action.payload.id
    },
    cancelChain(state, action: PayloadAction<string>) {
      const cardID = action.payload
      state.pendingChains = state.pendingChains.filter((id) => id !== cardID)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(confirmChain.pending, (state, action) => {
      console.log('chain started')
      const chained = action.meta.arg
      state.pendingChains = state.pendingChains.filter((id) => id !== chained)
    })
    builder.addCase(revealThunk.fulfilled, (state, action) => {
      const card = action.payload
      if (card.value === 'Q' || card.value === 'K') {
        state.pendingChains.push(card.id)
      }
    })
    builder.addCase(pregamePick.fulfilled, (state, action) => {
      const { uid, cards } = action.meta.arg
      const cardIDs = cards.map((c) => c.id)
      const user = state.players.find((p) => p.id === uid)
      user.cards = [
        ...user.cards.filter((c) => !cardIDs.includes(c.card.id)),
        ...cards.map((c) => ({ card: c, tier: 1 })),
      ]

      state.pregame[uid] = true
    })
    builder.addCase(confirmChain.fulfilled, (state, action) => {
      console.log('chain complete')
    })
    builder.addCase(playCardThunk.pending, (state) => {
      state.focused = ''
    })
    builder.addCase(playCardThunk.fulfilled, (state, action) => {
      const next = action.payload

      state.queue = [...new Set([next, ...state.queue])].filter((id) => !!id)
      state.turnLocks = []
      state.local.targetUID = ''
      state.local.faceUpPickID = ''
      state.activeSteal = {
        targeting: false,
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
  joinGame,
  setFaction,
  replace,
  focus,
  reverse,
  sortHand,
  addToStack,
  applyCardEffect,
  stealSingleCard,
  pickupStack,
  startBurn,
  completeBurn,
  startMiniburn,
  completeMiniburn,
  selectStealTarget,
  completeReveal,
  startReplenish,
  confirmReplenish,
  confirmAceTarget,
  cancelChain,
  startFupu,
  confirmFupu,
  selectAceTarget,
} = counterSlice.actions

export default counterSlice.reducer
