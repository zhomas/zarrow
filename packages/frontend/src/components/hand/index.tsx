import { motion } from 'framer-motion'
import { createDeck } from 'game'
import React, { FC } from 'react'

const ids = createDeck().map((c) => c.id)

interface ZoneProps {
  active: boolean
  handleDeal: () => void
}

const variants = {
  active: {
    opacity: 1,
    transition: { duration: 2 },
  },
}

export const Hand: FC<ZoneProps> = ({ active, children, handleDeal }) => {
  return (
    <div
      style={{
        padding: 5,
        paddingBottom: 10,
        backgroundColor: 'lightgray',
        minHeight: 200,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: 10,
          maxWidth: '100%',
          backgroundColor: active ? 'yellow' : 'transparent',
        }}
      >
        {children}
      </div>
      <button
        style={{ position: 'absolute', bottom: 10, right: 10 }}
        onClick={handleDeal}
      >
        Re-deal
      </button>
    </div>
  )
}
