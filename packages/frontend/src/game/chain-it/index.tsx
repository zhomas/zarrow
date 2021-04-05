import { styled } from '@linaria/react'
import {
  activePlayerSelector,
  GameDispatch,
  GameState,
  confirmChain,
  cancelChain,
  userModeSelector,
  CardModel,
} from 'game'
import React, { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { FluidCard } from '../card'

const FupuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  min-height: 100vh;
`

const _ChainIt: FC<Props> = ({ show, card, chainCard, cancelChain }) => {
  useEffect(() => {
    const c = show
    const timeout = setTimeout(() => {
      if (show) {
        cancelChain(card ? card.id : '')
      }
    }, 1000000)

    return () => clearTimeout(timeout)
  }, [show, card, cancelChain])

  if (!show) return null

  const handleClick = () => chainCard(card ? card.id : '')

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
        padding: '5vh',
      }}
    >
      <h1>Chain it?</h1>
      {card && <FluidCard card={card} onClick={handleClick}></FluidCard>}
    </FupuWrapper>
  )
}

const mapState = (state: GameState, { uid, card }: OwnProps) => {
  const modeSelector = userModeSelector(uid)
  return {
    show: card && modeSelector(state) === 'prompt:chain',
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    chainCard: (cardID: string) => {
      const action = confirmChain(cardID)
      dispatch(action)
    },
    cancelChain: (cardID: string) => {
      const action = cancelChain(cardID)
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  uid: string
  card?: CardModel
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const ChainIt = connector(_ChainIt)
