// import it from 'ava'
// import { createCard } from '../deck'
// import { activePlayerSelector, GameState } from '../game.slice'
// import { CardModel } from '../types'
// import { addToStack } from './play'

// const card = createCard('3', 'H')

// const getState = (): GameState => ({
//   direction: 1,
//   pickupPile: [card],
//   burnt: [],
//   queue: ['a'],
//   players: [
//     {
//       id: 'a',
//       faction: 0,
//       displayName: '',
//       cards: [{ card, tier: 2 }],
//     },
//     {
//       id: 'b',
//       faction: 0,
//       displayName: '',
//       cards: [{ card, tier: 2 }],
//     },
//     {
//       id: 'c',
//       faction: 0,
//       displayName: '',
//       cards: [{ card, tier: 2 }],
//     },
//     {
//       id: 'd',
//       faction: 0,
//       displayName: '',
//       cards: [{ card, tier: 2 }],
//     },
//   ],
//   stack: [],
// })

// it('plays multiple cards at once', (t) => {
//   const s = createCard('3', 'S')
//   const h = createCard('3', 'H')

//   const state = {
//     ...getState(),
//     players: [
//       {
//         id: 'a',
//         faction: 0,
//         displayName: '',
//         cards: [
//           { card: s, tier: 2 },
//           { card: h, tier: 2 },
//         ],
//       },
//     ],
//   }

//   addToStack(state, s, h)

//   t.is(state.players[0].cards.length, 0)
// })

// it('can play a 3 on a 3', (t) => {
//   const state = { ...getState(), stack: [card] }
//   addToStack(state, card)
//   t.is(state.stack.length, 2)
//   t.is(state.players[0].cards.length, 0)
// })

// it('can play 2 jacks on a JD', (t) => {
//   const state = { ...getState(), stack: [createCard('J', 'D')] }
//   addToStack(state, createCard('J', 'C'), createCard('J', 'S'))
//   t.is(state.stack.length, 3)
// })

// it('can play an 8 on a JD', (t) => {
//   const state = { ...getState(), stack: [createCard('J', 'D')] }
//   addToStack(state, createCard('8', 'H'))
//   t.is(state.stack.length, 2)
// })

// it('ends the turn when there are no cards to pick up', (t) => {
//   const state: GameState = {
//     ...getState(),
//     pickupPile: [],
//   }

//   const original = activePlayerSelector(state)
//   addToStack(state, createCard('8', 'D'))

//   t.not(activePlayerSelector(state).id, original.id)
// })
