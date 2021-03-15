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
  stackEffect?: StackEffect | ''
  activeSteal: {
    participants: string[]
    userSteals: number
    reciprocatedSteals: number
  }
}

const removeLock = (lock: TurnLock, state: GameState) => {
  const idx = state.turnLocks.findIndex((t) => t === lock)
  state.turnLocks.splice(idx, 1)
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
          state.turnLocks.push('steal:target')
          break
        default:
          break
      }

      if (!['Q', 'K'].includes(card.value)) {
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
    startFupu(state) {
      state.turnLocks.push('user:faceuptake')
    },
    startBurn(state) {
      state.turnLocks.push('burn')
      state.turnLocks = state.turnLocks.filter((l) => l !== 'animate')
    },
    completeBurn(state) {
      state.burnt = [...state.stack, ...state.burnt]
      state.stack = []
      state.turnLocks = state.turnLocks.filter((l) => l !== 'burn')
    },
    startMiniburn(state) {
      state.turnLocks.push('burn')
      state.turnLocks = state.turnLocks.filter((l) => l !== 'animate')
    },
    completeMiniburn(state) {
      const remove = state.stack.filter((c) => ['Q', 'K'].includes(c.value))
      state.turnLocks = state.turnLocks.filter((l) => l !== 'burn')

      for (const card of remove) {
        console.log('REMOVE: ', card.id)
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
      if (ok) {
        const others = player.cards.filter((c) => c.card.id !== revealed)
        player.cards = [...others, { card: createCardByID(revealed), tier: 1 }]
        removeLock('user:psychicreveal', state)
      }
    },
    startReplenish(state) {
      state.turnLocks.push('user:replenish')
    },
    confirmReplenish(state) {
      removeLock('user:replenish', state)
    },
    confirmAceTarget(state, action: PayloadAction<string>) {
      removeLock('user:target', state)
      state.local.targetUID = action.payload
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
  startFupu,
} = counterSlice.actions

export default counterSlice.reducer
