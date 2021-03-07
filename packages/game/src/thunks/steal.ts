import { unlockTurn } from '../game.slice'
import { applyClock, createAppThunk, playCardInternal } from './common'
import type { CardModel } from '../types'
import { activePlayerSelector } from '../selectors'

interface PlayCardArgs {
  exchanged: CardModel[]
  playerID: string
  targetID: string
}
