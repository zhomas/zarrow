import {
  CardModel,
  confirmTargeting,
  GameDispatch,
  GameState,
  playCardThunk,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

const _Reticule: FC<Props> = ({ show, targets, setTarget, cards }) => {
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
      {cards.map((c) => (
        <p>{c.id}</p>
      ))}
      {targets.map((t) => (
        <button key={t.id} onClick={() => setTarget(t.id, cards)}>
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
    show: state.turnPhase === 'user:target',
    targets: state.players.filter((p) => p.id !== ownProps.uid),
    cards: state.local ? state.local.targetingCards : [],
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    setTarget: (uid: string, cards: CardModel[]) => {
      const action = confirmTargeting(uid)
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
