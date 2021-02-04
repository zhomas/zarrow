import React, { FC } from 'react'
import { CardModel, DerivedPlayer, DerivedCardModel } from 'game'
import { Card } from './Card'
import { useState } from 'react'
import { useEffect } from 'react'

interface Props {
  player: DerivedPlayer
  highlighted: boolean
  playCards: (c: CardModel[]) => void
}

function getToggled<T>(list: T[], item: T) {
  return list.includes(item)
    ? list.filter((id) => id !== item)
    : [...list, item]
}

export const PlayerHand: FC<Props> = ({ player, playCards, highlighted }) => {
  const [selected, setSelected] = useState<DerivedCardModel[]>([])
  const [hovered, setHovered] = useState<DerivedCardModel[]>()

  const hand = player.cards.filter((c) => c.tier === 2)
  useEffect(() => {
    setSelected([])
  }, [player.cards])

  const playSelected = () => {
    playCards(selected.map((c) => c.card))
  }

  const renderCard = (c: DerivedCardModel) => {
    const handleClick = (e: React.SyntheticEvent) => {
      e.preventDefault()
      const matching = hand
        .filter((h) => h.card.value === c.card.value)
        .map((h) => h.card)

      playCards(matching)
    }

    const handleContextMenu = (e: React.SyntheticEvent) => {
      e.preventDefault()
      const n = getToggled(selected, c)
      setSelected(n)
    }

    return (
      <div
        style={{
          width: 120,
          position: 'relative',
          top: selected.includes(c) ? -20 : 0,
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        key={c.card.label}
      >
        <Card
          {...c.card}
          uiState={highlighted && !c.canPlay ? 'greyed' : 'default'}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        padding: 10,
        background: highlighted ? 'yellow' : 'transparent',
      }}
    >
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {hand.map((c) => renderCard(c))}
      </div>
      {selected.length > 0 && <button onClick={playSelected}>Play em!</button>}
    </div>
  )
}
