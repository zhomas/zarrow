import it from 'ava'
import { createCardByID } from '../deck'
import { currentTierSelector, onTurnSelector } from './player'

it('knows when a player is on his hand cards', (t) => {
  const selector = currentTierSelector('a')
  const result = selector({
    players: [
      {
        id: 'a',
        cards: [
          { tier: 1, card: createCardByID('3D') },
          { tier: 2, card: createCardByID('2D') },
        ],
        displayName: '',
        faction: 0,
      },
    ],
  })

  t.is(result, 'hand')
})

it('knows when a player is on his turn', (t) => {
  const selector = onTurnSelector('a')
  const result = selector({
    players: [
      {
        id: 'a',
        cards: [
          { tier: 1, card: createCardByID('3D') },
          { tier: 2, card: createCardByID('2D') },
        ],
        displayName: '',
        faction: 0,
      },
    ],
    queue: ['a'],
  })

  t.is(result, true)
})

it('knows when a player is not on his turn', (t) => {
  const selector = onTurnSelector('a')
  const result = selector({
    players: [
      {
        id: 'a',
        cards: [
          { tier: 1, card: createCardByID('3D') },
          { tier: 2, card: createCardByID('2D') },
        ],
        displayName: '',
        faction: 0,
      },
    ],
    queue: ['b'],
  })

  t.is(result, false)
})
