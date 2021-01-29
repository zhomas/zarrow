import it from 'ava'
import { createCard } from '../deck'
import { CardModel } from '../types'
import { playCard } from './play'

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
      cards: [{ card, tier: 2 }],
    },
  ],
  stack: [],
})

it('can play a 3 on an empty stack', (t) => {
  const state = getState()
  playCard(state, card)
  t.is(state.stack.length, 1)
  t.is(state.players[0].cards.length, 0)
})

it('replenishes the hand from the pickup pile', (t) => {
  const state = {
    ...getState(),
    pickupPile: [card, card, card, card],
  }

  playCard(state, card)
  t.is(state.players[0].cards.length, 4)
})

it('iterates the turn index when a card is played', (t) => {
  const state = { ...getState() }
  playCard(state, card)
  t.is(state.turnIndex, 1)
})

it('plays multiple cards at once', (t) => {
  const s = createCard('3', 'S')
  const h = createCard('3', 'H')

  const state = {
    ...getState(),
    players: [
      {
        id: 'a',
        cards: [
          { card: s, tier: 2 },
          { card: h, tier: 2 },
        ],
      },
    ],
  }

  playCard(state, s, h)

  t.is(state.players[0].cards.length, 0)
})

it('can play a 3 on a 3', (t) => {
  const state = { ...getState(), stack: [card] }
  playCard(state, card)
  t.is(state.stack.length, 2)
  t.is(state.players[0].cards.length, 0)
})

it('cannot play a 3 on a 4', (t) => {
  const four: CardModel = {
    value: '4',
    suit: 'D',
    label: '',
  }

  const state = { ...getState(), stack: [four] }

  playCard(state, card)

  t.is(state.stack.length, 1)
  t.is(state.players[0].cards.length, 1)
})
