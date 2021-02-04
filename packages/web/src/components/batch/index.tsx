import React, { FC } from 'react'
import { CardModel, DerivedPlayer, DerivedCardModel } from 'game'
import { useState } from 'react'
import { useEffect } from 'react'
import { BatchCard } from './batch.card'

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

export const Batch: FC<Props> = ({ player, playCards, highlighted }) => {
  const [selected, setSelected] = useState<DerivedCardModel[]>([])
  const [hovered, setHovered] = useState<DerivedCardModel[]>()

  const hand = player.cards.filter((c) => c.tier === 2)
  useEffect(() => {
    setSelected([])
  }, [player.cards])

  const playSelected = () => {
    playCards(selected.map((c) => c.card))
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
        {hand.map((c) => (
          <BatchCard
            card={c}
            selected={selected.includes(c)}
            toggleSelected={() => setSelected(getToggled(selected, c))}
            playAll={() => {}}
          />
        ))}
      </div>
      {selected.length > 0 && <button onClick={playSelected}>Play em!</button>}
    </div>
  )
}
