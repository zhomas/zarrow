import { GameState } from '../game.slice'
import { CardModel } from '../types'

export const moveToNextPlayer = (state: GameState, card: CardModel) => {
  state.turnIndex++
}
