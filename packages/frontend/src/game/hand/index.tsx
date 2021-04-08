import { motion } from 'framer-motion'
import { createDeck, UserMode } from 'game'
import React, { FC } from 'react'

interface ZoneProps {
  active: boolean
  playSelectedDisabled: boolean
  playSelected?: () => void
  cardsLength: number
  mode: UserMode
}

export const Hand: FC<ZoneProps> = ({
  active,
  children,
  playSelected,
  playSelectedDisabled,
  cardsLength,
  mode,
}) => {
  return (
    <div
      style={{
        padding: 5,
        paddingBottom: 10,
        backgroundColor: '#264f2cf0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <motion.div animate={{ scale: 0.85 }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 10,
            maxWidth: '100%',
          }}
        >
          {children}
        </div>
      </motion.div>
      <button
        style={{ position: 'absolute', bottom: 10, right: 10 }}
        onClick={playSelected}
        disabled={playSelectedDisabled}
      >
        Play selected
      </button>
    </div>
  )
}
