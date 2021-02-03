import React, { FC } from 'react'
import { CardModel, PlayerModel } from 'game'
import { Card } from './Card'

interface Props {
  player: PlayerModel
  highlighted: boolean
  onClick: (c: CardModel) => void
}

export const PlayerHand: FC<Props> = ({ player, onClick, highlighted }) => {
  const hand = player.cards.filter((c) => c.tier === 2)

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
        {hand.map((c, i) => (
          <div
            style={{ width: 120 }}
            onClick={() => onClick(c.card)}
            key={c.card.label}
          >
            <Card {...c.card} />
          </div>
        ))}
      </div>
    </div>
  )
}
