import { AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit'
import {
  CardModel,
  GameDispatch,
  GameState,
  shouldBurn,
  addToStack,
  applyCardEffect,
  startBurn,
  completeBurn,
  shouldMiniburn,
  startMiniburn,
  completeMiniburn,
  stealPhaseSelector,
} from '..'
import { CARD_FLIGHT_TIME } from '../constants'
import { createCardByID } from '../deck'

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type ThunkApiConfig = {
  dispatch: GameDispatch
  state: GameState
}

export function createAppThunk<Returned = void, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
) {
  return createAsyncThunk<Returned, ThunkArg, ThunkApiConfig>(
    typePrefix,
    payloadCreator,
  )
}

export const sleepUntil = async (fn: () => boolean) => {
  while (!fn()) {
    await sleep(100)
  }
}

export const confirmChain = createAppThunk(
  'game/confirmChain',
  async (cardID: string, { dispatch, getState }) => {
    const { pendingChains } = getState()

    const card = createCardByID(cardID)

    // dispatch(addToStack({ cards: [card] }))
    // await sleep(CARD_FLIGHT_TIME + 50)
    // await dispatch(startMiniburn())
    await playCardInternal([card], dispatch, getState)

    return card
  },
)

export const playCardInternal = async (
  cards: CardModel[],
  dispatch: GameDispatch,
  getState: () => GameState,
) => {
  dispatch(addToStack({ cards }))
  await sleep(CARD_FLIGHT_TIME + 50)

  const ready = () => {
    const st = getState()
    return (
      !st.animating &&
      !st.burning &&
      st.turnLocks.length === 0 &&
      st.pendingChains.length === 0 &&
      stealPhaseSelector(st) === 'none'
    )
  }

  if (shouldMiniburn(getState())) {
    dispatch(startMiniburn())
    await sleep(400)
    dispatch(completeMiniburn())
  }

  if (shouldBurn(getState())) {
    dispatch(startBurn())
    await sleep(1500)
    dispatch(completeBurn())
    return { burn: true }
  }

  dispatch(applyCardEffect(cards))

  await sleepUntil(ready)

  // const { pendingChains } = getState()

  // if (pendingChains.length > 0) {
  //   const cards = pendingChains.map((cID) => createCardByID(cID))

  //   for (const card of cards) {
  //     console.log('showing pending chain', card)
  //     await dispatch(showChainConfirm(card))
  //   }
  // }

  return { burn: false }
}
