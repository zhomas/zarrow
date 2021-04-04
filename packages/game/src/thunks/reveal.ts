import { createAppThunk, playCardInternal, sleep, sleepUntil } from './common'
import type { CardModel } from '../types'
import { activePlayerSelector } from '../selectors'
import {
  addToStack,
  completeBurn,
  completeReveal,
  shouldBurn,
  shouldMiniburn,
  startBurn,
} from '..'
import { CARD_FLIGHT_TIME } from '../constants'

interface PlayCardArgs {
  cards: CardModel[]
  playerID: string
}

export const revealThunk = createAppThunk(
  'game/psychic:reveal',
  async ({ cards, playerID }: PlayCardArgs, { dispatch, getState }) => {
    const [revealed] = cards
    const state = getState()
    const active = activePlayerSelector(state)

    if (active.id !== playerID) {
      throw new Error('Cannot reveal : not my go')
    }

    if (!state.turnLocks.includes('user:psychicreveal')) {
      throw new Error('Cannot reveal : no turn lock')
    }

    dispatch(completeReveal(revealed.id))
    await sleep(CARD_FLIGHT_TIME + 50)

    if (revealed.value === 'Q') {
      if (shouldBurn(getState(), revealed)) {
        dispatch(addToStack({ cards: [revealed] }))
        await sleep(CARD_FLIGHT_TIME + 50)
        //console.log(getState())
        dispatch(startBurn())
        await sleep(1500)
        dispatch(completeBurn())
      } else {
        await playCardInternal([revealed], dispatch, getState)
      }
    }
  },
)
