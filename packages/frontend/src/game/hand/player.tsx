import { styled } from '@linaria/react'
import {
  CardModel,
  GameDispatch,
  GameState,
  highlightedLocationSelector,
  isHandSortedSelector,
  otherStealParticipantSelector,
  sortHand,
  stealableCardsSelector,
  stealableFilter,
  stolenCardsSelector,
  userModeSelector,
} from 'game'
import { createCardByID } from 'game/dist/deck'
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
  display: flex;
  justify-content: center;
  position: relative;
  max-width: 80vw;
  margin: 0 auto;
`

const SortButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
`

export const PlaySelectedButton = styled.button`
  position: absolute;
  top: -40px;
  left: 50%;
  padding: 15px;
`

const _PlayerHand: FC<Props> = ({
  list,
  variant,
  curried,
  sorted,
  sort,
  playSelected,
}) => {
  return (
    <Wrapper>
      <CardsWrapper>
        {list.map((c) => {
          const props = curried(c.card, variant === 'hand')
          return <FluidCard key={c.card.id} {...props} />
        })}
        {variant === 'hand' && <Throbber point="right" left={-75} top={30} />}
      </CardsWrapper>
      <SortButton disabled={sorted} onClick={sort}>
        Sort it!
      </SortButton>
      {!!playSelected && (
        <PlaySelectedButton onClick={playSelected}>
          Play Selected
        </PlaySelectedButton>
      )}
    </Wrapper>
  )
}

const mapState = (state: GameState, { ownerID }: OwnProps) => {
  const myCards = state.players.find((p) => p.id === ownerID)?.cards || []
  const getHighlight = highlightedLocationSelector(ownerID)
  const mode = userModeSelector(ownerID)(state)
  const other = otherStealParticipantSelector(ownerID)(state)

  const stealable = stealableFilter(state)

  return {
    sorted: isHandSortedSelector(ownerID)(state),
    variant: getHighlight(state),
    list: [
      ...myCards.filter((c) => c.tier === 2),
      ...stolenCardsSelector(ownerID)(state).map((c) => ({
        card: c,
        tier: 2,
      })),
    ],
  }
}

const mapDispatch = (dispatch: GameDispatch, ownProps: OwnProps) => {
  return {
    sort: () => {
      dispatch(sortHand(ownProps.ownerID))
    },
  }
}

interface OwnProps {
  ownerID: string
  curried: (c: CardModel, a: boolean) => FluidCardProps
  playSelected?: () => void
  children?: JSX.Element[]
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const PlayerHand = connector(_PlayerHand)
