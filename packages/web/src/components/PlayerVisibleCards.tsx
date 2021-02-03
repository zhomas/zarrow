import React, { FC } from 'react'
import { PlayerModel } from 'game'
import { Card } from './Card'

interface Props {
  player: PlayerModel
  hasFocus: boolean
}

export const PlayerVisibleCards: FC<Props> = ({ player, hasFocus }) => {
  const downs = player.cards.filter((c) => c.tier === 0)
  const ups = player.cards.filter((c) => c.tier === 1)

  return (
    <div style={{ position: 'relative' }}>
      {hasFocus && (
        <div style={{ width: 20, height: 20, background: 'yellow' }}></div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          top: 200,
          left: -20,
        }}
      >
        {ups.map((c, i) => (
          <div style={{ width: 120 }} key={c.card.label}>
            <Card {...c.card} />
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {downs.map((c, i) => (
          <div style={{ width: 120 }} key={c.card.label}>
            <Card {...c.card} faceDown />
          </div>
        ))}
      </div>
    </div>
  )
}
