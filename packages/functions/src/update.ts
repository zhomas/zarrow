import * as admin from 'firebase-admin'
import * as cors from 'cors'
import {
  createGameStore,
  GameState,
  joinGame,
  setFaction,
  deal as dealCards,
  createDeck,
  playCard,
  pickupStack,
  endTurn,
} from 'game'
import { CardModel } from 'game/src/types'

type Data<T> = { data: T }

const getStore = async (gameID: string) => {
  const doc = await admin.firestore().collection('games').doc(gameID).get()
  const game = doc.data() as GameState
  return createGameStore(game)
}

type Deal = {
  verb: 'deal'
}

type Play = {
  verb: 'play'
  cards: CardModel[]
}

type Faction = {
  verb: 'changeFaction'
  faction: number
}

type Join = {
  verb: 'join'
  displayName: string
}

type PickupStack = {
  verb: 'pickup'
  additions: CardModel[]
}

type EndTurn = {
  verb: 'endTurn'
}

export type GameUpdatePayload =
  | Deal
  | Join
  | Play
  | Faction
  | PickupStack
  | EndTurn

export type GameUpdate = {
  uid: string
  gid: string
  payload: GameUpdatePayload
}

const getAction = (data: GameUpdate) => {
  const { uid } = data

  if (data.payload.verb === 'join') {
    const { displayName } = data.payload
    return joinGame({ uid, displayName })
  }

  if (data.payload.verb === 'deal') {
    const deck = createDeck(28)
    return dealCards({ deck, factions: [] })
  }

  if (data.payload.verb === 'changeFaction') {
    const { faction } = data.payload
    return setFaction({ faction, uid })
  }

  if (data.payload.verb === 'pickup') {
    return pickupStack(data.payload.additions)
  }

  if (data.payload.verb === 'endTurn') {
    return endTurn()
  }

  const { cards } = data.payload
  return playCard({ cards, playerIndex: 0 })
}

const updateGame = async (req, res) => {
  return cors()(req, res, async () => {
    const { data } = req.body as Data<GameUpdate>
    const action = getAction(data)
    const { dispatch, getState } = await getStore(data.gid)
    dispatch(action)
    const rawState = getState()
    console.log({ rawState })

    await admin.firestore().collection('games').doc(data.gid).set(getState())

    res.json({ result: 'ok' })
  })
}

export default updateGame
