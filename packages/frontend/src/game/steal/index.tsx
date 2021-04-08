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
import { PlayerCard } from 'game/dist/types'

const Wrapper = styled.div`
  &&& {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    position: static;
    z-index: 10;
    justify-content: center;
    align-items: center;
    zoom: 1.1;
    background: #000000c2;
    color: #fff;

    > div {
      display: flex;
    }
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
        {theirCards.map((pc) => (
          <FluidCard
            key={pc.card.id}
            card={pc.card}
            faceDown={pc.tier !== 1}
            onClick={() => stealCards(pc.card)}
          />
        ))}
      </div>

      <h1>{message}</h1>
    </Wrapper>
  )
}

const mapState = (state: GameState, { uid, cards }: OwnProps) => {
  const selectMode = userModeSelector(uid)
  const selectTier = highestTierSelector(uid)

  const mode = selectMode(state)

  return {
    theirCards: cards,
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
  cards: PlayerCard[]
}

const connector = connect(mapState, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const Steal = connector(StealView)
