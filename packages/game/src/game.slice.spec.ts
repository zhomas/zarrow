import reducer, {
  activeTierSelector,
  deal,
  initialState,
  pickupStack,
  playCard,
} from './game.slice'
import it from 'ava'
import { CardModel } from './types'

it('chooses from the active tier', (t) => {
  const card: CardModel = {
    value: '3',
    suit: 'D',
    label: '',
  }

  const a = activeTierSelector({
    pickupPile: [],
    burnt: [],
    direction: 1,
    queue: ['a'],
    players: [
      {
        id: 'a',
        faction: 0,
        cards: [
          { card, tier: 0 },
          { card, tier: 0 },
          { card, tier: 1 },
        ],
      },
    ],
    stack: [],
  })

  t.is(a.length, 1)
})
