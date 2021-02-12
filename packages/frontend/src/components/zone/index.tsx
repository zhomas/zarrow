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
        <motion.div
          animate={{
            opacity: promptActive ? [0, 1, 1, 0] : [0.2, 0.2, 0.2],
            backgroundColor: promptActive ? '#FFE135' : 'white',
          }}
          transition={{ repeatType: 'loop', repeat: Infinity }}
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
        <motion.div
          animate={{}}
          style={{
            position: 'relative',
            width: 126,
            height: 176,
            pointerEvents: 'none',
            top: Array.isArray(children) ? children.length * -1.5 : 0,
          }}
        >
          {Array.isArray(children)
            ? children.map((c, i) => (
                <div
                  key={ids[i]}
                  style={{
                    position: 'absolute',
                    top: i * 1.5,
                    left: 0,
                    zIndex: children.length - i,
                  }}
                >
                  {c}
                </div>
              ))
            : children}
        </motion.div>
      </div>
    </div>
  )
}
