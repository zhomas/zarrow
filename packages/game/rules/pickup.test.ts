import it from 'ava'
import { CardModel } from '../types'
import { pickup } from './pickup'

const card: CardModel = {
  value: '3',
  suit: 'D',
  label: '',
}

const getState = () => ({
  turnIndex: 0,
  pickupPile: [],
  burnt: [],
  players: [
    {
      id: 'a',
      cards: [{ card, tier: 1 }],
    },
  ],
  stack: [card, card, card],
})

it('transfers cards to player hand upon pickup', (t) => {
  const state = getState()
  pickup(state, card)
  const inHand = state.players[0].cards.filter((c) => c.tier === 2)
  t.is(inHand.length, 4)
})

it('adds a face up card to hand upon pickup', (t) => {
  const state = getState()
  pickup(state, card)
  const faceUps = state.players[0].cards.filter((c) => c.tier === 1)
  const inHand = state.players[0].cards.filter((c) => c.tier === 2)
  t.is(faceUps.length, 0)
  t.is(inHand.length, 4)
})

//it('reverts to the last player that played', (t) => {})
