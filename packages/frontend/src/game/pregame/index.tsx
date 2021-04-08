import React, { FC } from 'react'
import {
  GameState,
  userModeSelector,
  CardModel,
  GameDispatch,
  highestTierSelector,
  stealPhaseSelector,
  stealCardThunk,
  pregamePick,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'
import { Screen } from '../game.style'
import { createCardByID } from 'game/dist/deck'

const Wrapper = styled.div`
  &&& {
    background: rgb(0 0 0 / 82%);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    grid-area: 2 / 2 / 5 / 5;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    color: #fff;
  }
`

const BigButton = styled.button`
  display: block;
  padding: 25px;
`

const PregameOverlay: FC<Props> = ({
  active,
  message,
  disabled,
  phase,
  onClick,
}) => {
  if (phase === 'inactive') return null

  return (
    <Wrapper>
      <h1>{phase === 'pick' ? 'Pick 4' : 'Done'}</h1>
      {phase === 'pick' && (
        <BigButton disabled={disabled} onClick={onClick}>
          Ready!
        </BigButton>
      )}
    </Wrapper>
  )
}

const mapState = (state: GameState, { uid, selected }: OwnProps) => {
  const selectMode = userModeSelector(uid)
  const selectTier = highestTierSelector(uid)

  const mode = selectMode(state)

  const getPhase = () => {
    switch (mode) {
      case 'pregame':
        return 'pick'
      case 'pregame:ready':
        return 'wait'
      default:
        return 'inactive'
    }
  }

  return {
    active: true,
    message: mode === 'pregame' ? 'Pick 4' : 'Waiting',
    phase: getPhase(),
    disabled: selected.length !== 4 || (state.pregame && state.pregame[uid]),
  } as const
}

const mapDispatch = (dispatch: GameDispatch, { uid, selected }: OwnProps) => {
  return {
    onClick: () => {
      console.log('woohoo')
      const action = pregamePick({
        cards: selected.map((c) => createCardByID(c)),
        uid,
      })

      dispatch(action)
    },
  }
}

type OwnProps = {
  uid: string
  selected: string[]
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const Pregame = connector(PregameOverlay)
