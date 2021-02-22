import { styled } from '@linaria/react'
import { CardModel, GameState, highlightedLocationSelector } from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { FluidCard } from '../card'
import { Throbber } from '../throbber'

const Wrapper = styled.div`
  padding: 24px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
`

const CardsWrapper = styled.div`
  max-width: 160px;
  display: flex;
  justify-content: center;
  position: relative;
`

const _PlayerHand: FC<Props> = ({ list, variant, curried }) => {
  return (
    <Wrapper>
      <CardsWrapper>
        {list.map((c) => {
          const props = curried(c.card, variant === 'hand')
          return <FluidCard key={c.card.id} {...props} />
        })}
        {variant === 'hand' && <Throbber point="right" left={-75} top={30} />}
      </CardsWrapper>
    </Wrapper>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const myCards =
    state.players.find((p) => p.id === ownProps.ownerID)?.cards || []
  const getHighlight = highlightedLocationSelector(ownProps.ownerID)

  return {
    list: myCards.filter((c) => c.tier === 2),
    variant: getHighlight(state),
  }
}

interface OwnProps {
  ownerID: string
  curried: (c: CardModel, a: boolean) => FluidCardProps
  children?: JSX.Element[]
}

const connector = connect(mapState)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const PlayerHand = connector(_PlayerHand)
