import React, { FC } from 'react'
import { CardModel } from 'game'
import { Card } from './Card'

interface Props {
  cards: CardModel[]
  onClick: () => void
  highlighted: boolean
}

export const Stack: FC<Props> = ({ cards, onClick, highlighted }) => {
  if (cards.length === 0) return <></>
  const top = cards[0]
  return (
    <div
      onClick={onClick}
      style={{
        padding: '0 10px',
        backgroundColor: highlighted ? 'yellow' : 'transparent',
      }}
    >
      <Card {...top} />
    </div>
  )
}
