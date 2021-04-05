import { styled } from '@linaria/react'
import {
  activePlayerSelector,
  GameDispatch,
  GameState,
  confirmChain,
  userModeSelector,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { FluidCard } from '../card'

const FupuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
`

const _ChainIt: FC<Props> = ({ show, cardID, chainCard }) => {
  if (!show) return null

  const handleClick = () => chainCard(cardID)

  return (
    <FupuWrapper
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        color: 'white',
        padding: '25vh',
      }}
    >
      <h1>Chain it?</h1>
      <button onClick={handleClick}>Chain it</button>
    </FupuWrapper>
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const active = activePlayerSelector(state)
  const modeSelector = userModeSelector(uid)
  return {
    show: modeSelector(state) === 'prompt:chain',
    cardID: state.pendingChains ? state.pendingChains[0] : '',
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    chainCard: (cardID: string) => {
      const action = confirmChain(cardID)
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

export const ChainIt = connector(_ChainIt)
