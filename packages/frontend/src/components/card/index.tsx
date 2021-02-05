import React, { FC } from 'react'
import { CardModel } from 'game'
import { Draggable, DraggableProps } from 'react-beautiful-dnd'

type Props = {
  card: CardModel
  index: number
  uiState?: 'greyed' | 'default'
  faceDown?: boolean
  disabled?: boolean
  onClick?: () => void
}

export const EmptyCard = () => {
  return (
    <div
      style={{
        height: 200,
        width: 140,
        borderRadius: 10,
        border: '1px solid black',
        position: 'relative',
        backgroundColor: 'white',
        padding: 10,
      }}
    ></div>
  )
}

export const Card = ({ card }: { card: CardModel }) => {
  return (
    <div
      style={{
        height: 200,
        width: 140,
        borderRadius: 10,
        border: '1px solid black',
        position: 'relative',
        backgroundColor: 'white',
        padding: 10,
        color: card.suit === 'D' || card.suit === 'H' ? 'red' : 'black',
      }}
    >
      <span>
        {card.value}
        {card.suit}
      </span>
    </div>
  )
}

export const DraggableCard: FC<Props> = ({
  index,
  card,
  faceDown,
  uiState,
  onClick,
  disabled = false,
}) => {
  if (faceDown) {
    return (
      <div
        style={{
          height: 200,
          width: 140,
          background: 'red',
          borderRadius: 10,
          border: '1px solid black',
        }}
      ></div>
    )
  }

  return (
    <Draggable draggableId={card.label} index={index} isDragDisabled={disabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
        >
          <Card card={card} />
        </div>
      )}
    </Draggable>
  )
}
