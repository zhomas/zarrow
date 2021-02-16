import { motion } from 'framer-motion'
import { createDeck } from 'game'
import React, { FC } from 'react'
import { FluidCardProps } from '../../typings'
import { FluidCard } from '../card'

const ids = createDeck().map((c) => c.id)

interface ZoneProps {
  promptLabel: string
  onPrompt?: () => void
  promptActive: boolean
  cards: JSX.Element[]
}

const variants = {
  active: {
    opacity: 1,
    transition: { duration: 2 },
  },
}

export const Zone: FC<ZoneProps> = ({
  promptLabel,
  promptActive,
  children,
  onPrompt,
  cards,
}) => {
  return (
    <div
      onClick={promptActive ? onPrompt : undefined}
      style={{
        padding: 10,
        position: 'relative',
        zIndex: 0,

        cursor: promptActive ? 'grab' : 'default',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 126,
          height: 176,
          pointerEvents: 'none',
          top: Array.isArray(children) ? children.length * -1.5 : 0,
        }}
      >
        {cards.map((c, i) => (
          <div
            key={ids[i]}
            style={{
              position: 'absolute',
              top: i * 1.5,
              left: 0,
              zIndex: cards.length - i,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}
