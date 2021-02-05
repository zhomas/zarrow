import * as admin from 'firebase-admin'
import * as cors from 'cors'
import { createGame } from 'game'

const newGame = async (req, res) => {
  return cors()(req, res, async () => {
    const st = createGame()
    const result = await admin.firestore().collection('games').add(st)
    res.json({ data: { id: result.id } })
  })
}

export default newGame
