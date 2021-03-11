import { styled } from '@linaria/react'
import { GameState, stealableFilter } from 'game'
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
        <FluidCard key={c.card.id} card={c.card} faceDown style={{}} />
      ))}
    </Wrapper>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const myCards =
    state.players.find((p) => p.id === ownProps.ownerID)?.cards || []

  return {
    list: myCards.filter((c) => c.tier === 2),
  }
}

interface OwnProps {
  ownerID: string
}

const connector = connect(mapState)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const EnemyHand = connector(_EnemyHand)
