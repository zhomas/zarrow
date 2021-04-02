import { styled } from '@linaria/react'
import {
  activePlayerSelector,
  CardModel,
  GameDispatch,
  GameState,
  confirmFupu,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { FluidCard } from '../card'

const FupuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const _FUPU: FC<Props> = ({ show, cards, handleClick }) => {
  if (!show) return null

  return (
    <FupuWrapper
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        color: 'white',
        padding: '25vh',
      }}
    >
      <h1>Pick a card to pickup:</h1>
      <CardsWrapper>
        {cards.map((c) => (
          <FluidCard key={c.id} card={c} onClick={() => handleClick(c)} />
        ))}
      </CardsWrapper>
    </FupuWrapper>
  )
}

const mapState = (state: GameState, { uid, cards }: OwnProps) => {
  const active = activePlayerSelector(state)

  return {
    show: cards.length > 0,
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    handleClick: (c: CardModel) => {
      const action = confirmFupu(c)
      dispatch(action)
    },
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  uid: string
  cards: CardModel[]
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const FUPU = connector(_FUPU)
