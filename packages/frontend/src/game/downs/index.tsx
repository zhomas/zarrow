import {
  canCardPlay,
  CardModel,
  GameDispatch,
  GameState,
  playCardThunk,
  stackDestinationSelector,
  userModeSelector,
  focus,
} from 'game'
import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { FluidCard } from '../../components/card'

const _FaceDowns: FC<Props> = ({
  cards,
  canCardPlay,
  active,
  playCard,
  focusCard,
  isFocused,
}) => {
  const getClickHandler = (card: CardModel) => {
    if (active) {
      const ok = canCardPlay(card)
      console.log('revealed!')
      if (ok) {
        return () => playCard(card)
      } else {
        return () => focusCard(card)
      }
    }

    return undefined
  }

  return (
    <div
      style={{
        backgroundColor: active ? 'yellow' : 'transparent',
        padding: 10,
      }}
    >
      <div style={{ display: 'flex' }}>
        {cards.map(({ card }) => (
          <div key={card.id}>
            <FluidCard
              onClick={getClickHandler(card)}
              card={card}
              variant="default"
              faceDown={!isFocused(card)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const myCards = state.players.find((p) => p.id === ownProps.uid)?.cards || []
  const getMode = userModeSelector(ownProps.uid)
  const dest = stackDestinationSelector(state)
  return {
    cards: myCards.filter((c) => c.tier === 0),
    active: getMode(state) === 'play:downs',
    canCardPlay: (c: CardModel) => canCardPlay(c, dest),
    isFocused: (c: CardModel) => !!state.focused && state.focused === c.id,
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    playCard: (c: CardModel) => {
      const action = playCardThunk({ cards: [c] })
      dispatch(action)
    },
    focusCard: (c: CardModel) => {
      const action = focus(c.id)
      dispatch(action)
    },
    pickup: () => {},
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  uid: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const FaceDowns = connector(_FaceDowns)
