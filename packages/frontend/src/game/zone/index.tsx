import { motion } from 'framer-motion'
import { createDeck } from 'game'
import React, { FC } from 'react'
import { Throbber } from '../throbber'

const ids = createDeck().map((c) => c.id)

interface ZoneProps {
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
  promptActive,
  children,
  onPrompt,
  cards,
}) => {
  return (
    <div
      style={{
        marginRight: 1,
      }}
    >
      <div
        onClick={promptActive ? onPrompt : undefined}
        style={{
          padding: 10,
          position: 'relative',
          zIndex: 0,

          cursor: promptActive ? 'grab' : 'default',
        }}
      >
        {promptActive && (
          <motion.div
            animate={{
              opacity: [0, 1, 1, 0],
              backgroundColor: '#FFE135',
            }}
            transition={{
              repeatType: 'loop',
              repeat: promptActive ? Infinity : 1,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '1px solid #0000007d',
              borderRadius: 12,
              zIndex: -1,
            }}
          />
        )}
        <div
          style={{
            position: 'relative',
            width: 126,
            height: 176,
            pointerEvents: 'none',
            top: cards.length * -1.5,
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
          {promptActive && <Throbber point="up" top="120%" left="25%" />}
        </div>
      </div>
    </div>
  )
}
