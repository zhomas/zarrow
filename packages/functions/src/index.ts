import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import cors from 'cors'
import { createGame } from 'game'

admin.initializeApp()

interface GameCreate {
  hostID: string
}

export const newGame = functions.https.onRequest(async (req, res) => {
  return cors()(req, res, async () => {
    const body = req.body as GameCreate
    const state = createGame(body.hostID)
    const result = await admin.firestore().collection('games').add(state)
    res.json({ id: result.id })
  })
})
