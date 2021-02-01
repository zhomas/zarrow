import it from 'ava'
import { createCard } from '../deck'
import { activePlayerSelector } from '../game.slice'
import { playAce } from './ace'
import { getDummyState } from './_test.helpers'

it('adds to the stack', (t) => {
  const state = getDummyState()
  const length = state.stack.length
  playAce(state, {
    cards: [createCard('A', 'C')],
    targetID: 'b',
  })

  t.is(state.stack.length, length + 1)
})

it('does nothing if a card other than an ace is played', (t) => {
  const state = getDummyState()
  const length = state.stack.length
  playAce(state, {
    cards: [createCard('K', 'C')],
    targetID: 'b',
  })

  t.is(state.stack.length, length)
})

it('defines the next target', (t) => {
  const state = getDummyState()
  playAce(state, {
    cards: [createCard('A', 'C')],
    targetID: 'c',
  })

  t.is(activePlayerSelector(state).id, 'c')
})
