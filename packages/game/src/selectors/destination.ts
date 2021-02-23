import { GameState } from '..'
import { createCard } from '../deck'

type PartialState = Pick<GameState, 'stack' | 'afterimage'>

export const stackDestinationSelector = (state: PartialState) => {
  if (state.afterimage && state.afterimage.length) {
    return state.afterimage[0]
  }

  for (const card of state.stack) {
    if (card.value === '8') continue
    return card
  }

  return createCard('3', 'H') // anything can play on a 3
}
