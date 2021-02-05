import it from 'ava'
import { createDeck } from '../deck'
import { modeSelector } from '../selectors/status'
import { changeFaction, createGame, joinGame } from './create'
import { dealCards } from './deal'

it('creates a game with an owner', (t) => {
  const state = createGame()
  t.is(state.players.length, 0)
})

it('lets others join a game before it has started', (t) => {
  const state = createGame()
  joinGame(state, 'a', '')
  joinGame(state, 'b', 'Quentin')
  t.is(state.players.length, 2)
  t.is(state.players[1].displayName, 'Quentin')
})

it('lets players switch factions', (t) => {
  const state = createGame()
  joinGame(state, 'a', '')
  changeFaction(state, 'a', 1)
  t.is(state.players[0].faction, 1)
})
