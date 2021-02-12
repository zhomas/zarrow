import {
  CardModel,
  GameDispatch,
  GameState,
  hasLock,
  playCardThunk,
  unlockTurn,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

const _Reticule: FC<Props> = ({ show, targets, setTarget }) => {
  return show ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
      }}
    >
      <h1>Targeting reticule!</h1>
      {targets.map((t) => (
        <button key={t.id} onClick={() => setTarget(t.id)}>
          {t.id}
        </button>
      ))}
    </div>
  ) : (
    <></>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  return {
    show: hasLock('user:target')(state),
    targets: state.players.filter((p) => p.id !== ownProps.uid),
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    setTarget: (uid: string) => {
      const action = unlockTurn({ channel: 'user:target', data: uid })
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  uid: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const Reticule = connector(_Reticule)
