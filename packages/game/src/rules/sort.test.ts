import it from 'ava'
import { cardsInHandSelector, faceUpsSelector, GameState } from '..'
import { createCard } from '../deck'
import { isHandSortedSelector, sortHand } from './sort'

it('sorts a players hand', (t) => {
  const state = {
    players: [
      {
        id: 'a',
        cards: [
          { card: createCard('9', 'D'), tier: 2 },
          { card: createCard('3', 'D'), tier: 2 },
        ],
        displayName: 'Tom',
        faction: 0,
      },
    ],
  }

  sortHand(state, 'a')
  const hand = cardsInHandSelector('a')(state)

  t.is(hand[0].value, '3')
  t.is(hand[1].value, '9')
})

it('does not sort the players face ups', (t) => {
  const state = {
    players: [
      {
        id: 'a',
        cards: [
          { card: createCard('9', 'D'), tier: 2 },
          { card: createCard('9', 'D'), tier: 1 },
          { card: createCard('3', 'D'), tier: 2 },
          { card: createCard('3', 'D'), tier: 1 },
        ],
        displayName: 'Tom',
        faction: 0,
      },
    ],
  }

  sortHand(state, 'a')
  const ups = faceUpsSelector('a')(state)
  t.is(ups[0].value, '9')
  t.is(ups[1].value, '3')
})

it('recognises when cards need sorting', (t) => {
  const selector = isHandSortedSelector('a')
  t.false(
    selector({
      players: [
        {
          id: 'a',
          cards: [
            { card: createCard('9', 'D'), tier: 2 },
            { card: createCard('3', 'D'), tier: 2 },
          ],
          displayName: 'Tom',
          faction: 0,
        },
      ],
    }),
  )

  t.true(
    selector({
      players: [
        {
          id: 'a',
          cards: [
            { card: createCard('3', 'D'), tier: 2 },
            { card: createCard('9', 'D'), tier: 2 },
          ],
          displayName: 'Tom',
          faction: 0,
        },
      ],
    }),
  )
})
