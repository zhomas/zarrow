import { useEffect, useState } from 'react'
import firebase from 'firebase'
import { DerivedGameState } from 'game'

const initial: DerivedGameState = {
  prompt: 'null',
  next: '',
  burnt: [],
  focus: '',
  direction: 0,
  pickupPile: [],
  players: [],
  queue: [],
  stack: [],
  mode: 'lobby',
}

export const useGame = (gameID: string | undefined) => {
  const [game, setGame] = useState<DerivedGameState>(initial)

  useEffect(() => {
    const unsub = firebase
      .firestore()
      .collection('games')
      .doc(gameID)
      .onSnapshot((snap) => {
        const gm = { ...snap.data() } as DerivedGameState
        setGame(gm)
      })

    return () => {
      unsub()
    }
  }, [gameID])

  return game
}
