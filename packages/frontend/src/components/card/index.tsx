import React, { FC } from 'react'
import { CardModel } from 'game'
import { motion } from 'framer-motion'

type Props = {
  card: CardModel
  uiState?: 'greyed' | 'default'
  faceDown?: boolean
  disabled?: boolean
  onClick?: () => void
}

export const EmptyCard = () => {
  return (
    <div
      style={{
        height: 200,
        width: 140,
        borderRadius: 10,
        border: '1px solid black',
        position: 'relative',
        backgroundColor: 'white',
        padding: 10,
      }}
    ></div>
  )
}

const variants = {
  faceUp: {
    rotateY: 0,
  },
  faceDown: {
    rotateY: -180,
  },
}

export const FluidCard: FC<Props> = ({
  card,
  faceDown,
  onClick,
  disabled = false,
}) => {
  return (
    <motion.div
      layoutId={card.label}
      onClick={onClick}
      style={{
        width: 140,
        height: 200,
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
      variants={variants}
      animate={faceDown ? 'faceDown' : 'faceUp'}
    >
      <div
        style={{
          borderRadius: 10,
          border: '1px solid black',
          position: 'absolute',
          width: 140,
          height: 200,
          top: 0,
          left: 0,
          backgroundColor: 'white',
          padding: 10,
          zIndex: 2,
          color: card.suit === 'D' || card.suit === 'H' ? 'red' : 'black',
          backfaceVisibility: 'hidden',
        }}
      >
        <span>
          {card.value}
          {card.suit}
        </span>
      </div>
      <div
        style={{
          width: 140,
          height: 200,
          background: 'red',
          position: 'absolute',
          top: 0,

          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      ></div>
    </motion.div>
  )
}
