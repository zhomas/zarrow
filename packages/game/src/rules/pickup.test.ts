import it from 'ava'
import { GameState } from '../game.slice'
import { CardModel } from '../types'
import { pickup } from './pickup'
import { activePlayerSelector } from '../selectors'

const card: CardModel = {
  value: '3',
  suit: 'D',
  id: '',
}

const getState = (): GameState => ({
  direction: 1,
  queue: ['a', 'b'],
  pickupPile: [],
  turnLocks: [],
  burnt: [],
  afterimage: [],
  activeSteal: {
    userSteals: 0,
    reciprocatedSteals: 0,
    participants: [],
    pendingChains: [],
  },
  players: [
    {
      id: 'a',
      faction: 0,
      displayName: '',
      cards: [{ card, tier: 1 }],
    },
    {
      id: 'b',
      faction: 0,
      displayName: '',
      cards: [{ card, tier: 1 }],
    },
  ],
  stack: [card, card, card],
})

it('transfers cards to current player hand upon pickup', (t) => {
  const state = getState()
  const player = activePlayerSelector(state)
  pickup(state)

  const inHand = player.cards.filter((c) => c.tier === 2)
  t.is(inHand.length, 3)
  t.is(state.stack.length, 0)
})

it('adds a face up card to hand upon pickup', (t) => {
  const state = getState()
  pickup(state, card)
  const faceUps = state.players[0].cards.filter((c) => c.tier === 1)
  const inHand = state.players[0].cards.filter((c) => c.tier === 2)
  t.is(faceUps.length, 0)
  t.is(inHand.length, 4)
})

it('reverts to the last player that played', (t) => {
  const state = getState()
  t.is(activePlayerSelector(state).id, 'a')
  pickup(state)
  t.is(activePlayerSelector(state).id, 'b')
})

it('adds the focus card upon pickup', (t) => {
  const state: GameState = {
    ...getState(),
    focused: '9C',
  }
  t.falsy(state.players[0].cards.find((c) => c.card.id == state.focused))
  pickup(state)
  t.truthy(state.players[0].cards.find((c) => c.card.id == state.focused))
})
