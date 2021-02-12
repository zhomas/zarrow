import { motion } from 'framer-motion'
import { createDeck } from 'game'
import React, { FC } from 'react'

const ids = createDeck().map((c) => c.id)

interface ZoneProps {
  promptLabel: string
  onPrompt?: () => void
  promptActive: boolean
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
}) => {
  return (
    <div
      style={{
        margin: 1,
      }}
    >
      <div
        style={{
          padding: 20,
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: promptActive ? '#ffff6c' : '#ffffff3b',
            border: promptActive
              ? '1px solid #0000007d'
              : '1px solid #00000012',
            borderRadius: 12,
          }}
        />
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 200,
            zIndex: 0,
          }}
        >
          {Array.isArray(children)
            ? children.map((c, i) => (
                <div
                  key={ids[i]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: children.length - i,
                  }}
                >
                  {c}
                </div>
              ))
            : children}
        </div>
      </div>
      <button
        style={{ padding: '10px 20px' }}
        disabled={!promptActive && !!onPrompt}
        onClick={onPrompt}
      >
        {promptLabel}
      </button>
    </div>
  )
}
