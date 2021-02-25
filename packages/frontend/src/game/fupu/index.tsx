import {
  activePlayerSelector,
  CardModel,
  GameDispatch,
  GameState,
  unlockTurn,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { FluidCard } from '../card'

const _FUPU: FC<Props> = ({ show, list, handleClick }) => {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        color: 'white',
        padding: '10vh',
      }}
    >
      <h1>Pick a card to pickup:</h1>
      <div>
        {list.map((c) => (
          <FluidCard
            key={c.card.id}
            keyPrefix={'fup'}
            card={c.card}
            onClick={() => handleClick(c.card)}
          />
        ))}
      </div>
    </div>
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const list =
    state.players
      .find((p) => p.id === uid)
      ?.cards.filter((c) => c.tier === 1) || []

  const active = activePlayerSelector(state)

  return {
    show:
      active.id === uid &&
      state.turnLocks?.some((c) => c === 'user:faceuptake'),
    list,
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    handleClick: (c: CardModel) => {
      const action = unlockTurn({ channel: 'user:faceuptake', data: c.id })
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

export const FUPU = connector(_FUPU)
