import firebase from 'firebase'
import type { GameUpdate, GameUpdatePayload } from 'functions'

type API = (update: GameUpdate) => void

export const useGameDispatch = (
  gid: string | undefined,
  uid: string | undefined,
) => {
  const fn = firebase.functions().httpsCallable('update') as API

  return (payload: GameUpdatePayload) => {
    if (gid && uid) {
      fn({ gid, uid, payload })
    }
  }
}
