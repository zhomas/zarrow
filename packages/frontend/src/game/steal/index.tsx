import React, { FC } from 'react'
import {
  GameState,
  userModeSelector,
  stealableCardsSelector,
  stealSingleCard,
  CardModel,
  GameDispatch,
  highestTierSelector,
  otherStealParticipantSelector,
  stealPhaseSelector,
  stealCardThunk,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { styled } from '@linaria/react'
import { FluidCard } from '../card'

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
  theirCards,
  stealCards,
  yoinked,
  message,
}) => {
  if (!active) return null

  return (
    <Wrapper>
      <div>
        {theirCards.map((props) => (
          <FluidCard
            key={props.card.id}
            {...props}
            onClick={() => stealCards(props.card)}
          />
        ))}
      </div>

      <h1>{message}</h1>
    </Wrapper>
  )
}

const mapState = (state: GameState, { uid }: OwnProps) => {
  const selectMode = userModeSelector(uid)
  const other = otherStealParticipantSelector(uid)(state)
  const selectTier = highestTierSelector(uid)
  const stealable = stealableCardsSelector(state)

  const mode = selectMode(state)

  const theirCards =
    mode === 'steal:pick'
      ? stealable(other).map((card) => ({
          card,
          faceDown: highestTierSelector(other)(state) !== 1,
        }))
      : []

  return {
    theirCards,
    selected: [],
    reciprocal: stealPhaseSelector(state) === 'reciprocate',
    active: mode === 'steal:pick' || mode === 'steal:receive',
    message: mode,
    faceDown: selectTier(state) !== 1,
    yoinked: [],
  }
}

const mapDispatch = (dispatch: GameDispatch, { uid }: OwnProps) => {
  return {
    stealCards: (card: CardModel) => {
      const action = stealCardThunk({ playerID: uid, cardID: card.id })
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
