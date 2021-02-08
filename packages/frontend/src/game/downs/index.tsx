import {
  canCardPlay,
  CardModel,
  createDeck,
  GameDispatch,
  GameState,
  playCard,
  stackDestinationSelector,
  userModeSelector,
  focus,
} from 'game'
import React, { FC, useEffect, useState } from 'react'
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
  const handleClick = (c: CardModel) => {
    const ok = canCardPlay(c)
    console.log('revealed!')
    if (ok) {
      playCard(c)
    } else {
      focusCard(c)
    }
    //alert(`You clicked :: ${c.label}`)
    //alert(ok ? 'It CAN play on the stack' : 'It cannot play on the stack!')
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
          <div onMouseDown={() => handleClick(card)} key={card.label}>
            <FluidCard card={card} faceDown={!isFocused(card)} />
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
    isFocused: (c: CardModel) =>
      !!state.focused &&
      state.focused.suit === c.suit &&
      state.focused.value === c.value,
  }
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    playCard: (c: CardModel) => {
      const action = playCard({ cards: [c] })
      dispatch(action)
    },
    focusCard: (c: CardModel) => {
      const action = focus(c)
      dispatch(action)
    },
    pickup: (c: CardModel) => {},
  }
}

const connector = connect(mapState, mapDispatch)

interface OwnProps {
  uid: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const FaceDowns = connector(_FaceDowns)
