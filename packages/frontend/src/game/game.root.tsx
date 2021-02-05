import { GameDispatch, GameState, modeSelector, replace } from 'game'
import React, { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Lobby } from './game.lobby'
import { GameView } from './game.view'
import firebase from 'firebase'

type Props = ReduxProps & { uid: string; gid: string }

const Root: FC<Props> = ({ mode, uid, gid, replace }) => {
  useEffect(() => {
    const unsub = firebase
      .firestore()
      .collection('games')
      .doc(gid)
      .onSnapshot((snap) => {
        if (snap.metadata.hasPendingWrites) return
        if (snap.metadata.fromCache) return

        const gm = { ...snap.data() } as GameState
        console.log('Snapshot', performance.now())
        replace(gm)
      })

    return () => {
      unsub()
    }
  }, [gid, replace])

  switch (mode) {
    case 'lobby':
    case 'lobby:valid':
      return <Lobby uid={uid} />
    default:
      return <GameView uid={uid} />
  }
}

const mapState = (state: GameState) => {
  return { mode: modeSelector(state) }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    replace: (s: GameState) => {
      dispatch(replace(s))
    },
  }
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

export const GameRoot = connector(Root)
