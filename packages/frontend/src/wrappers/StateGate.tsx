import React, { FC, useEffect, useState } from 'react'
import firebase from 'firebase'
import 'firebase/firestore'
import { createGame, GameState } from 'game'

interface Props {
  gid: string
  children: (st: GameState) => JSX.Element
}

export const StateGate: FC<Props> = ({ gid, children }) => {
  const [state, setState] = useState<GameState>()

  useEffect(() => {
    const fn = async () => {
      const doc = await firebase.firestore().collection('games').doc(gid).get()
      if (doc.exists) {
        const data = doc.data() as GameState
        setState({
          ...data,
          local: {
            targetUID: '',
            faceUpPickID: '',
          },
        })
      } else {
        await firebase
          .firestore()
          .collection('games')
          .doc(gid)
          .set(createGame())

        fn()
      }
    }

    fn()
  }, [gid])

  return state ? <> {children(state)} </> : <h1>Loading...</h1>
}
