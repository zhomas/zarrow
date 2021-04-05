import { styled } from '@linaria/react'
import { CardModel, GameState, stealableFilter } from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCard } from '../card'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  z-index: -1;
`

const _EnemyHand: FC<Props> = ({ list }) => {
  return (
    <Wrapper>
      {list.map((c) => (
        <FluidCard key={c.id} card={c} faceDown style={{}} />
      ))}
    </Wrapper>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  return {
    list: ownProps.cards,
  }
}

interface OwnProps {
  ownerID: string
  cards: CardModel[]
}

const connector = connect(mapState)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const EnemyHand = connector(_EnemyHand)
