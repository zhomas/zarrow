import {
  canCardPlay,
  CardModel,
  GameState,
  stackDestinationSelector,
  userModeSelector,
} from 'game'
import React, { FC, useEffect, useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { connect, ConnectedProps } from 'react-redux'

import { Card, DraggableCard, FaceDownCard } from '../../components/card'

const _FaceDowns: FC<Props> = ({ cards, canCardPlay, active }) => {
  const [revealed, setRevealed] = useState('')

  const handleClick = (c: CardModel) => {
    const ok = canCardPlay(c)
    setRevealed(c.label)
    console.log('revealed!')
    //alert(`You clicked :: ${c.label}`)
    //alert(ok ? 'It CAN play on the stack' : 'It cannot play on the stack!')
  }

  useEffect(() => {
    setRevealed('')
  }, [cards])

  return (
    <div
      style={{
        backgroundColor: active ? 'yellow' : 'transparent',
        padding: 10,
      }}
    >
      <Droppable droppableId={'downs'}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ display: 'flex' }}
          >
            {cards.map(({ card }) => (
              <div onMouseDown={() => handleClick(card)}>
                <DraggableCard
                  card={card}
                  index={0}
                  faceDown={card.label !== revealed}
                />
                {provided.placeholder}
              </div>
            ))}
          </div>
        )}
      </Droppable>
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
  }
}

const connector = connect(mapState)

interface OwnProps {
  uid: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

export const FaceDowns = connector(_FaceDowns)
