import { CardModel } from '../types'
import { createAppThunk } from './common'

interface PregamePickArgs {
  cards: CardModel[]
  uid: string
}

export const pregamePick = createAppThunk(
  'game/pregame:pick',
  async ({ cards, uid }: PregamePickArgs, { getState }) => {
    const state = getState()
    const self = state.players.find((p) => p.id === uid)

    if (!self) {
      throw new Error('not a player!')
    }

    if (cards.length !== 4) {
      throw new Error('Must pick 4 cards to go face up')
    }

    if (!cards.every((c) => self.cards.find((pc) => pc.card.id === c.id))) {
      throw new Error('Cards do not belong to uid')
    }
  },
)
