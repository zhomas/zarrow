import { createAppThunk, confirmChain, sleep } from './common'
import { activePlayerSelector } from '../selectors'
import { stealSingleCard } from '..'
import { CARD_FLIGHT_TIME } from '../constants'
import { createCardByID } from '../deck'

interface PlayCardArgs {
  cardID: string
  playerID: string
}

export const stealCardThunk = createAppThunk(
  'game/steal',
  async ({ cardID, playerID }: PlayCardArgs, { dispatch, getState }) => {
    const stolen = createCardByID(cardID)
    const state = getState()
    const active = activePlayerSelector(state)

    if (!state.activeSteal.participants.includes(playerID)) {
      throw new Error('Cannot steal : not my go')
    }

    dispatch(stealSingleCard({ cardID: stolen.id, userID: playerID }))

    await sleep(CARD_FLIGHT_TIME + 50)
  },
)
