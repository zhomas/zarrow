import React, { FC } from 'react'
import { CardModel, DerivedPlayer, DerivedCardModel } from 'game'
import { Card } from '../Card'

interface Props {
  card: DerivedCardModel
  selected: boolean
  toggleSelected: () => void
  playAll: () => void
}

export const BatchCard: FC<Props> = ({
  card,
  selected,
  playAll,
  toggleSelected,
}) => {
  const handleClick = (e: React.SyntheticEvent) => {
    e.preventDefault()
    playAll()
  }

  const handleContextMenu = (e: React.SyntheticEvent) => {
    e.preventDefault()
    toggleSelected()
  }

  return (
    <div
      style={{
        width: 120,
        position: 'relative',
        top: selected ? -20 : 0,
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      key={card.card.label}
    >
      <Card {...card.card} uiState={!card.canPlay ? 'greyed' : 'default'} />
    </div>
  )
}
