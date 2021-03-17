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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
      stealPhaseSelector(st) === 'none'
    )
  }

  if (shouldBurn(getState())) {
    dispatch(startBurn())
    await sleep(1500)
    dispatch(completeBurn())
    return { burn: true }
  }

  dispatch(applyCardEffect(cards))

  await sleepUntil(ready)

  if (shouldMiniburn(getState())) {
    dispatch(startMiniburn())
    await sleep(400)
    dispatch(completeMiniburn())
  }

  await sleepUntil(ready)
  return { burn: false }
}
