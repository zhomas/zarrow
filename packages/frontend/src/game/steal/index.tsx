import React, { FC, useEffect, useState } from 'react'
import {
  GameState,
  userModeSelector,
  stealableCardsSelector,
  stealSingleCard,
  CardModel,
  GameDispatch,
  highestTierSelector,
  myStealableCardsSelector,
  theirStealableCardsSelector,
  activePlayerSelector,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'
import { FluidCard } from '../card'
import { createCardByID } from 'game/dist/deck'
import { FluidCardProps } from '../../typings'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  position: static;
  z-index: 0;
  justify-content: center;
  align-items: center;
  zoom: 1.1;
  background: #000000c2;
  color: #fff;

  > div {
    display: flex;
  }
`

const StealView: FC<Props> = ({
  selected,
  reciprocal,
  active,
  cards,
  theirCards,
  stealCards,
}) => {
  if (!active) return null

  return (
    <Wrapper>
      <div>
        <h5>Theirs:</h5>
        {theirCards.map((props) => (
          <FluidCard
            key={props.card.id}
            {...props}
            selected={selected.includes(props.card.id)}
            onClick={() => stealCards(props.card)}
          />
        ))}
      </div>
      <h1>{reciprocal ? 'Reciprocate!' : 'Steal!'}</h1>
      <div>
        {cards.map((props) => (
          <FluidCard
            key={props.card.id}
            {...props}
            selected={selected.includes(props.card.id)}
          />
        ))}
      </div>
    </Wrapper>
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const selectMode = userModeSelector(uid)
  const selectTier = highestTierSelector(uid)
  const stealable = stealableCardsSelector(state)

  const mode = selectMode(state)
  const other =
    uid === state.activeSteal.targetID
      ? activePlayerSelector(state).id
      : state.activeSteal.targetID
  const cards: FluidCardProps[] = stealable(uid).map((card) => ({
    card,
    faceDown: selectTier(state) !== 1,
  }))

  const theirCards = stealable(other).map((card) => ({
    card,
    faceDown: selectTier(state) !== 1,
  }))

  return {
    cards,
    theirCards,
    selected: [
      ...state.activeSteal.userSelected,
      ...state.activeSteal.reciprocated,
    ],
    reciprocal: state.turnLocks
      ? state.turnLocks.includes('steal:reciprocate')
      : false,
    active: mode === 'steal:pick' || mode === 'steal:receive',
    faceDown: selectTier(state) !== 1,
  }
}

const mapDispatch = (dispatch: GameDispatch, { uid }: OwnProps) => {
  return {
    stealCards: (card: CardModel) => {
      const action = stealSingleCard({ userID: uid, cardID: card.id })
      dispatch(action)
    },
  }
}

type OwnProps = {
  uid: string
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const Steal = connector(StealView)
