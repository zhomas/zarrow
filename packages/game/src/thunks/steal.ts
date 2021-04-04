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
  startMiniburn,
  stealSingleCard,
} from '..'
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
    const { activeSteal } = getState()

    const activeID = activePlayerSelector(state).id
    const stealOwner = playerID === activeID

    const { pendingChains, userSteals, reciprocatedSteals } = activeSteal
    const pendingSteals = reciprocatedSteals + userSteals

    if (pendingSteals === 0 && pendingChains.length > 0) {
      const cards = pendingChains.map((cID) => createCardByID(cID))

      dispatch(addToStack({ cards }))
      await sleep(CARD_FLIGHT_TIME + 50)
      await dispatch(startMiniburn())

      for (const card of cards) {
        await playCardInternal([card], dispatch, getState)
      }
    }

    // if (stealOwner) {
    // } else {
    //   //
    // }

    // if (['Q', 'K'].includes(stolen.value)) {
    //   if (shouldBurn(getState(), stolen)) {
    //     dispatch(addToStack({ cards: [stolen] }))
    //     await sleep(CARD_FLIGHT_TIME + 50)
    //     dispatch(startBurn())
    //     await sleep(1500)
    //     dispatch(completeBurn())
    //   } else {
    //     //await playCardInternal([stolen], dispatch, getState)
    //   }
    // }
  },
)
