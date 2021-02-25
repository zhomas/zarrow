import it from 'ava'
import { activePlayerSelector, getStore } from '..'
import { createCard } from '../deck'
import { pickupThunk } from './pickup'

it('resolves the players when I pick up from myself', async (t) => {
  const store = getStore({
    queue: ['a'],
    players: [
      {
        id: 'a',
        cards: [{ card: createCard('3', 'D'), tier: 0 }],
        displayName: '',
        faction: 0,
      },
      {
        id: 'b',
        cards: [{ card: createCard('4', 'D'), tier: 0 }],
        displayName: '',
        faction: 1,
      },
    ],
    focused: '3D',
  })

  const action = pickupThunk()

  await store.dispatch(action)

  t.is(activePlayerSelector(store.getState()).id, 'b')
})
