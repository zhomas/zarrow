import { AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit'
import {
  CardModel,
  GameDispatch,
  GameState,
  shouldBurn,
  addToStack,
  applyCardEffect,
  addClock,
  resolveClock,
  startBurn,
  completeBurn,
  shouldMiniburn,
  startMiniburn,
  completeMiniburn,
} from '..'
import { CARD_FLIGHT_TIME } from '../constants'
import { TurnClock } from '../types'

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

export const applyClock = createAppThunk(
  'game/clock',
  async (clock: TurnClock, { dispatch }) => {
    dispatch(addClock(clock))
    await new Promise((resolve) => setTimeout(resolve, 1500))
    dispatch(resolveClock(clock))
  },
)

export const playCardInternal = async (
  cards: CardModel[],
  dispatch: GameDispatch,
  getState: () => GameState,
) => {
  dispatch(addToStack({ cards }))
  await sleep(CARD_FLIGHT_TIME + 50)

  if (shouldBurn(getState())) {
    dispatch(startBurn())
    await sleep(1500)
    dispatch(completeBurn())
    return { burn: true }
  }

  dispatch(applyCardEffect(cards))

  await sleepUntil(() => getState().turnLocks.length === 0)

  if (shouldMiniburn(getState())) {
    dispatch(startMiniburn())
    await sleep(400)
    dispatch(completeMiniburn())
  }

  await sleepUntil(() => getState().turnLocks.length === 0)
  return { burn: false }
}
