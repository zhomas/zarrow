import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import createGame from './create'
import updateGame from './update'

admin.initializeApp()

export const create = functions.https.onRequest(createGame)
export const update = functions.https.onRequest(updateGame)
export type { GameUpdate } from './update'
export type { GameUpdatePayload } from './update'
